export interface Label_type {
    nodes: {
        [key: string]: string
    },
    states: {
        [key: string]: {
            [key: string]: string
        }
    },
    evidence_groups: {
        [key: string]: {
            num: number,
            labels: {
                [key: string]: string
            }
        }
    },
}

export interface Labelmap {
    [key: string]: string
}

export interface CustomLabels {
    [key: string]: Labelmap
}