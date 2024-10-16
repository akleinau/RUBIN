export interface PhaseGoal {
    name: string,
    direction: string,
    option: string
}

export interface Phase {
    name: string,
    labels: {
        [key: string]: string
    }[],
    sets: {
        evidence_groups: string[],
        goal: PhaseGoal[],
        target: string[]
    }

}