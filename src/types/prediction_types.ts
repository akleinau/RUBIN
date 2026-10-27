export interface Prediction_type {
    options: Prediction_option[],
    likelyResult: Prediction_option[] | null,
    selectedOption: Prediction_option | null,
}

export interface Prediction_option {
    /** Goal outcome probabilities keyed by goal node name. */
    goalValues: {
        [key: string]: number
    },
    /** Intervention states keyed by target node name. */
    option: {
        [key: string]: string
    },
    value: number,
    /** Added by predictions-table.vue when current/compare rows are merged. */
    config_name?: string,
}