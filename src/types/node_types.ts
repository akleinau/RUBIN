export interface NOption {
    name: string;
}

export interface SOption extends NOption {
    node: string;
}

export interface NNode {
    name : string;
    options : NOption[];
}

export interface NGoal{
    direction : string;
    name : string;
    options : NOption[];
    selected: NOption;
}

export interface NEvidence {
    name : string;
    group : string;
    group_name : string;
    options : SOption[];
    selected : SOption;
    selectedCompare? : string;
}

export interface NTarget {
    label? : string;
    name : string;
    options : NOption[];
}

export interface Patient_type {
        targets : NTarget[]
        evidence : NEvidence[] // {group:"", group_name:"",name:"", options:Array({name:"", node:""})selected:Array({name:"",node:""})}
        goals : NGoal[] // {direction:"", name:"", options:Array({name:""})selected:{name:""}}
        nodes : NNode[] //nodes of the network that are neither evidence, goals, nor targets {name:"", options:Array({name:""})}
        name : string
}