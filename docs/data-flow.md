# RUBIN data flow

This document describes how data moves through the RUBIN frontend. The frontend
does not perform Bayesian-network inference itself. It collects the clinician's
inputs, sends them to the DoctorBN backend, stores the returned calculations in
Pinia, and derives the tables and visualisations from that state.

## End-to-end flow

```text
Network selection or upload
          |
          v
       App.vue
          |
          v
 page-interface.vue
          |
          v
   useStore().loadNodes()
          |
          +--> GET /getNetwork?network=<name>
          |       (predefined network)
          |
          +--> POST /getLocalNetwork
                  (uploaded network and optional customisation)
          |
          v
 Store network metadata
 (nodes, states, labels, edges, phases)
          |
          v
 Clinician selects evidence, targets, and goals
          |
          v
 usePatientStore
 (patient.evidence, targets, goals, nodes)
          |
          v
       calculate()
          |
          +--> POST /calcTargetForGoals
          |       -> predictions.options
          |       -> predictions.likelyResult
          |       -> predictions.selectedOption
          |
          +--> calculateExplanations()
                  |
                  +--> POST /calcOptions
                          -> explain.relevance
                          -> explain.states
                          -> explain.explanation
          |
          v
 Vue components read Pinia state
 and render tables, bars, and network graphs
```

The backend base URL is defined by `address` in
[`src/store.ts`](../src/store.ts). The network list is loaded directly by
[`select-network.vue`](../src/components/NetworkLoading/select-network.vue).
Uploaded files are read in the browser by
[`upload-network.vue`](../src/components/NetworkLoading/upload-network.vue);
their contents are retained in memory and sent to the backend when the
network is initialised or a calculation is requested.

## 1. Choosing and initialising a network

There are two network sources:

- **Predefined network:** `select-network.vue` obtains names from
  `GET /loadNetList`. Selecting a name emits it to `App.vue`, which passes it
  to `page-interface.vue`.
- **Uploaded network:** `upload-network.vue` reads one `.net` or `.bif` file
  with `FileReader`. It emits an object containing `name`, `fileString`,
  `fileFormat`, `description`, and optional `customText`.

When the interface is mounted, `page-interface.vue` sets `network` and
`localNet` on the main store and calls `loadNodes()`.

### `loadNodes()` requests

For a predefined network:

```http
GET /getNetwork?network=<network-name>
```

For an uploaded network:

```http
POST /getLocalNetwork
Content-Type: application/json

{
  "fileString": "<network file contents>",
  "fileFormat": "net | bif",
  "description": "<description>"
}
```

The backend network response is normalised into frontend state:

| Backend field | Store field | Purpose |
| --- | --- | --- |
| `states` | `patient.nodes`, `labels.states` | Available nodes and state options |
| `edges` | `edges` | Network connections used by D3 visualisations |
| `description` | `description` | Network description |
| `labels` | `labels.nodes`, `network_translation.original_labels` | Node labels |
| `customization` | `phases`, `evidenceGroupMap`, translations, colours | Optional network-specific UI configuration |

If an uploaded customisation file was supplied, its JSON (`customText`) takes
precedence over the customisation returned with the network. The store then
selects the initial phase, applies labels, and calls `calculate()`. A
calculation only sends a request when at least one goal exists.

## 2. Building the patient input

[`usePatientStore`](../src/stores/patient_store.ts) owns the clinician's
network-specific input. These collections describe the intended role of each
node while it is being configured:

- `nodes`: available, unassigned network nodes
- `evidence`: observed patient values; each item has a selected state
- `targets`: variables for which the backend should find interventions
- `goals`: desired states and a direction (`increase` or `decrease`, as
  configured by the network)

The input components update this store through `addEvidences`, `deleteEvidence`,
`addTargets`, `deleteTarget`, `addGoals`, and `deleteGoal`. These actions remove
assigned nodes from `patient.nodes` and put them back when an assignment is
deleted. The actions do not themselves enforce exclusivity between `evidence`,
`targets`, and `goals`; phase configuration and the UI are responsible for
presenting compatible choices. Each input change calls `Store.calculate()`, so
the prediction and explanation requests are re-run from the current state.

The store converts the richer UI objects into the compact backend maps:

```json
{
  "evidences": {
    "<node-name>": "<selected-state>"
  },
  "goals": {
    "<node-name>": "<desired-state>"
  },
  "goalDirections": {
    "<node-name>": "<direction>"
  },
  "target": ["<target-node-name>"]
}
```

Evidence nodes are excluded from `goals` and `target` before sending. This
prevents the same node from being treated as both observed and unknown during
inference.

## 3. Prediction request and response

`calculate()` sends `POST /calcTargetForGoals`. For a predefined network the
request contains `network`, `evidences`, `target`, `goals`, and
`goalDirections`. For an uploaded network it additionally contains
`fileString` and `fileFormat`.

The response is expected to contain:

```json
{
  "optionResults": [
    {
      "option": { "<node-name>": "<state>" },
      "goalValues": { "<goal-name>": 0.0 },
      "value": 0.0
    }
  ],
  "likelyResults": {
    "goalValues": { "<goal-name>": 0.0 },
    "value": 0.0
  }
}
```

The store maps this response to `predictions`:

- `optionResults` becomes the list of possible intervention configurations.
- `likelyResults` becomes a synthetic first option with an empty `option`.
- `selectedOption` is initially the likely result. When recalculating, the
  previous selection is retained if an equivalent option still exists.

[`predictions-table.vue`](../src/components/Prediction/predictions-table.vue)
renders `predictions.options`. It displays each option's intervention states
and `goalValues`; selecting a row updates `predictions.selectedOption` and
starts a new explanation request.

## 4. Explanation request and response

After prediction data has been stored, `calculateExplanations()` sends
`POST /calcOptions` for the currently selected option. Its request contains
`network`, `evidences`, `options`, `goals`, and `goalDirections`; uploaded
networks also include `fileString` and `fileFormat`. `options` is the selected
prediction's intervention map, or `null` when no option is selected.

The response is expected to contain:

```json
{
  "relevance": [
    {
      "node_name": "<node-name>",
      "overall_relevance": 0.0,
      "relevancies": { "<goal-name>": 0.0 }
    }
  ],
  "nodes": [
    {
      "name": "<node-name>",
      "state": "<state>",
      "probability": 0.0,
      "distribution": [0.0],
      "stateNames": ["<state>"]
    }
  ],
  "explanation": {
    "nodes": ["<node-name>"],
    "edges": [
      { "source": "<node-name>", "target": "<node-name>" }
    ]
  }
}
```

The response is copied into `Store.explain`:

| Response field | Store field | Main consumer |
| --- | --- | --- |
| `relevance` | `explain.relevance` | `relevance-explanation.vue` |
| `nodes` | `explain.states` | `list-explanation.vue`, `sugiyama-vis.vue` |
| `explanation` | `explain.explanation` | `page-explanation.vue` for the compact graph |

The full graph uses `Store.edges` loaded during `loadNodes()`. The compact
graph intersects those edges with `explain.explanation.nodes` and highlights
the returned explanation. Labels are applied at render time from
`Store.labels`, so backend node and state names remain stable even when the
selected language changes.

## 5. Loading and error states

`optionsLoading` covers the prediction request and `explanationLoading`
covers the explanation request. The interface uses these flags to show
progress and block relevant tutorial sections. A non-OK prediction response
throws an error after clearing `optionsLoading`; JSON parsing errors set
`Store.error`. The explanation request currently assigns the decoded response
directly, so changes to that backend contract should be reflected in
`calculateExplanations()` and the explanation types together.

Strict phase mode can stop calculation before any request is made when the
configured phase requirements are not satisfied. Phase changes update targets
and goals from the network customisation and trigger a fresh calculation.

## 6. Comparison and saved patient data

Comparison keeps a snapshot of `patient`, `predictions`, and `explain` in
`compareConfig`. The same calculation methods can be invoked with
`calculate(true)` to populate the comparison snapshot. Components merge the
current and comparison results for side-by-side tables and graph states.

`usePatientStore.generate_patient()` returns the complete in-memory patient
configuration for that snapshot. `createCSVcontent()` serialises evidence,
targets, and goals for `POST /generateEndoriskId`; this endpoint is separate
from the prediction/explanation flow and returns a text identifier.

## Source-of-truth files

- [`src/store.ts`](../src/store.ts): backend URL, requests, response mapping,
  loading/error state, phases, labels, and comparison calculations.
- [`src/stores/patient_store.ts`](../src/stores/patient_store.ts): patient
  input collections and their mutations.
- [`src/types/node_types.ts`](../src/types/node_types.ts): network and patient
  input shapes.
- [`src/types/prediction_types.ts`](../src/types/prediction_types.ts):
  prediction response shape used by the UI.
- [`src/types/explanation_types.ts`](../src/types/explanation_types.ts):
  explanation response shapes used by the UI.
