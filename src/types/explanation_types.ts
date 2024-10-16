export interface ExplainNode {
    name: string,
    label: string,
    state: string,
    probability: number,
    beforeState: string,
    beforeProb: number,
    distribution: number[],
    stateNames: string[]
}

export interface CompareExplainNode extends ExplainNode {
    "compare_probability": number,
    "compare_distribution": number[],
    "compare_stateNames": string[]
}

export interface RelevancePrediction {
    node_name: string,
    overall_relevance: number,
    relevancies: {
        [key: string]: number
    }[]
}

export interface RelevanceNode extends RelevancePrediction {
        config_name: string,
        label: string,
        state: string,
}

export interface NetworkExplanation {
    edges: {
        source: string,
        target: string
    }[],
    nodes: string[]
}

export interface StateExplanation {
    distribution: number[],
    distribution_wo_evidence: number[],
    divergence: number,
    name: string,
    probability: number,
    state: string,
    stateNames: {
        [key: number]: string
    }[]
}

export interface Explain_type {
    explanation: NetworkExplanation | null,
    relevance: RelevancePrediction[],
    states: StateExplanation[]
}