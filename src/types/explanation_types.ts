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

export interface RelevanceNode {
        config_name: string,
        label: string,
        node_name: string,
        state: string,
        overall_relevance: number,
        relevancies: any
}