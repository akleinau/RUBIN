export interface ExplainNode {
    /** Node name and translated values prepared for list-explanation.vue. */
    name: string,
    label: string,
    state: string,
    probability: number,
    /** Comparison values are blank/zero in the non-comparison row shape. */
    beforeState: string,
    beforeProb: number,
    /** distribution[i] maps to stateNames[i]. */
    distribution: number[],
    stateNames: string[]
}

export interface CompareExplainNode extends ExplainNode {
    "compare_probability": number,
    "compare_distribution": number[],
    "compare_stateNames": string[]
}

export interface RelevancePrediction {
    /** Raw item returned in the backend `relevance` array. */
    node_name: string,
    overall_relevance: number,
    /** Keys use the `<goal-name>: <goal-state>` format built by the UI. */
    relevancies: {
        [key: string]: number
    }
}

export interface RelevanceNode extends RelevancePrediction {
        /** Added by relevance-explanation.vue for display and comparison. */
        config_name: string,
        label: string,
        state: string,
}

export interface Edge {
    source: string,
    target: string
}

export interface NetworkExplanation {
    edges: Edge[],
    nodes: string[]
}

export interface StateExplanation {
    /** Raw item returned in the backend `nodes` array. */
    distribution: number[],
    distribution_wo_evidence?: number[],
    divergence?: number,
    name: string,
    probability: number,
    state: string,
    /** distribution[i] corresponds to stateNames[i]. */
    stateNames: string[]
}

export interface Explain_type {
    /** Values stored after the /calcOptions response is received. */
    explanation: NetworkExplanation | null,
    relevance: RelevancePrediction[],
    states: StateExplanation[]
}