
class Edges {
    constructor(source, target) {
        this.source = source;
        this.target = target;
    }
}

class Nodes {
    constructor(name, options) {
        this.name = name;
        this.options = options;
    }
}

class Goals extends Nodes {
    constructor(name, options, direction, selected) {
        super(name, options);
        this.direction = direction;
        this.selected = selected;
    }
}

class Evidence extends Nodes {
    constructor(name, options, group, group_name, selected) {
        super(name, options);
        this.group = group;
        this.group_name = group_name;
        this.selected = selected;
    }
}

class Patient {
    constructor() {
        this.targets = []
        this.evidence = [] // {group:"", group_name:"",name:"", options:Array({name:"", node:""})selected:Array({name:"",node:""})}
        this.goals = [] // {direction:"", name:"", options:Array({name:""})selected:{name:""}}
        this.nodes = [] //nodes of the network that are neither evidence, goals, nor targets {name:"", options:Array({name:""})}
        this.name = ""
    }
}