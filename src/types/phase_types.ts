export interface PhaseGoal {
    name: string,
    direction: string,
    option: string,
    boundary?: number,
    TextBelow?: string,
    TextAbove?: string,
}

export interface Phase {
    name: string,
    labels: {
        [key: string]: string
    },
    sets: {
        evidence_groups: string[],
        goal: PhaseGoal[],
        target: string[]
    }

}