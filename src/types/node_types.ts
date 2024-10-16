export interface NNode {
    name : string;
    options : {name: string}[];
}

export interface NGoal{
    direction : string;
    name : string;
    options : {name: string}[];
    selected: {name: string};
}

export interface NEvidence {
    name : string;
    group : string;
    group_name : string;
    options : {name: string, node: string}[];
    selected : {name: string, node: string};
    selectedCompare? : string;
}

export interface NTarget {
    label? : string;
    name : string;
    options : {name: string}[];
}

export interface Patient_type {
        targets : NTarget[]
        evidence : NEvidence[] // {group:"", group_name:"",name:"", options:Array({name:"", node:""})selected:Array({name:"",node:""})}
        goals : NGoal[] // {direction:"", name:"", options:Array({name:""})selected:{name:""}}
        nodes : NNode[] //nodes of the network that are neither evidence, goals, nor targets {name:"", options:Array({name:""})}
        name : string
}