export interface Prediction_type {
    options: Prediction_option[],
    likelyResult: Prediction_option[] | null,
    selectedOption: Prediction_option | null,
}

export interface Prediction_option {
    goalValues: {
        [key: string]: number
    },
    option: {
        [key: string]: number
    },
    value: number
}