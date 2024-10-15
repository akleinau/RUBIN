
interface Edge {
        source: String
        target: String
}

interface Nodes {
    name : string;
    options : any[];
}

interface Goals extends Nodes {
    direction : string;
    selected : any;
}

interface Evidence extends Nodes {
    group : any;
    group_name : string;
    selected : any;
}

interface Patient {
        targets : any[]
        evidence : any[] // {group:"", group_name:"",name:"", options:Array({name:"", node:""})selected:Array({name:"",node:""})}
        goals : any[] // {direction:"", name:"", options:Array({name:""})selected:{name:""}}
        nodes : any[] //nodes of the network that are neither evidence, goals, nor targets {name:"", options:Array({name:""})}
        name : string
}