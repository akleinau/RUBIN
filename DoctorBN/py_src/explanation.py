from pgmpy import inference
from anytree import NodeMixin, RenderTree, PreOrderIter
import itertools


class Support:
    forbidden_set = []


class SupportNode(NodeMixin, Support):
    def __init__(self, name, parent=None, children=None, forbidden_set=None):
        self.name = name
        self.parent = parent
        if children:
            self.children = children
        self.forbidden_set = forbidden_set

def find_changed_set(root, set, evidences, network, nodes):
    infer = inference.VariableElimination(network)
    query_set = []
    reduced_set = []
    for item in set:
        if item in evidences.keys():
            reduced_set.append(item)
        else:
            query_set.append(item)


    withEvidence = infer.map_query(query_set, evidence=evidences)
    standard = infer.map_query(query_set)

    for item in query_set:
            if withEvidence[item] != standard[item]:
                reduced_set.append(item)
    return reduced_set

def find_differing_set(root, set, evidences, network, nodes):
    reduced_set = []
    parent_divergence = 0
    for node in nodes:
        if node['name'] == root.name:
            parent_divergence = node['divergence']
            break

    for item in set:
        if item in evidences.keys():
            reduced_set.append(item)
        else:
            item_divergence = 0
            for node in nodes:
                if node['name'] == item:
                    item_divergence = node['divergence']
                    break
            if (item_divergence - parent_divergence) > 0.03:
                reduced_set.append(item)

    return reduced_set

# reduce markov blanket to smallest set of elements, that still gets the same classifications
def find_smallest_set(root, set, evidences, network, nodes):
    #smallest set of an evidence is empty set
    if root.name in evidences: return []

    infer = inference.VariableElimination(network)
    ancestors = [root]
    a = root
    while a.parent:
        a = a.parent
        ancestors.append(a)
    ancestor_map = infer.map_query([x.name for x in ancestors], evidence=evidences)
    map = {}
    for item in set:
        if item in evidences.keys():
            map[item] = evidences.get(item)
        else:
            map.update(infer.map_query([item], evidence=evidences))

    found = []
    length = 1
    while length < len(map) - 1:
        for nodes in itertools.combinations(map, length):
            e = {node: map.get(node) for node in nodes}
            same = True
            for x in ancestors:
                result = infer.map_query([x.name], evidence=e)
                same = same and result[x.name] == ancestor_map[x.name]
            if same:
                found.append(nodes)

        # if just one subset is found, return that one
        if len(found) == 1: return list(found[0])

        # sort nodes by amount of evidences
        def evidence_func(nodes):
            i = 0
            for node in nodes:
                if node in evidences.keys():
                    i += 1
            return i

        if len(found) > 1:
            found.sort(reverse=True, key=evidence_func)
            return list(found[0])
        length += 1

    return set


def add_markov_children(root, network, evidences=None, variables=None, subsetFunc=None, nodes=None):
    blanket = network.get_markov_blanket(root.name)

    # find smallest set of nodes
    cleanedBlanket = []
    for node in blanket:
        if node not in root.forbidden_set:
            cleanedBlanket.append(node)

    small_blanket = cleanedBlanket
    if subsetFunc:
        subset_evidence = {}
        for ev in evidences:
            subset_evidence[ev] = evidences[ev]
        for var in variables:
            subset_evidence[var] = variables[var]
        small_blanket = subsetFunc(root, cleanedBlanket, subset_evidence, network, nodes)

    # construct forbidden sets and add nodes
    for node in small_blanket:
        forbidden_set = [x for x in root.forbidden_set]  # copy by value
        forbidden_set.append(node)

        # check if it's a parent of root
        if root.name in network.get_parents(node):
            for parent in network.get_parents(node):
                if parent not in forbidden_set:
                    forbidden_set.append(parent)

        # check if it's a child of a parent of root
        for c in network.get_children(node):
            if root.name in network.get_parents(c):
                if c not in forbidden_set:
                    forbidden_set.append(c)


        if not evidences or node not in evidences.keys():
            sn = SupportNode(node, parent=root, forbidden_set=forbidden_set)
            add_markov_children(sn, network, evidences, variables, subsetFunc, nodes)
        else:
            sn = SupportNode(node, parent=root)


def deleteUseless(root, network, evidences, variables, most_relevant_nodes):
    # if root is evidence itself, don't delete
    evidence_list = []
    if most_relevant_nodes:
        evidence_list = most_relevant_nodes
    else:
        evidence_list = evidences.keys()

    if root.name in evidence_list:
        return 1

    # if roots children are useless, delete them
    for c in root.children:
        deleteUseless(c, network, evidences, variables, most_relevant_nodes)

    # if root is no evidence, but has no children, delete
    if not root.children and root.name not in variables.keys():
        root.parent = None


def compute_explanation_of_target(network, evidences, variables, outcomes, most_relevant_nodes, states):
    rootNodes = []
    # create node list
    nodes = []
    edges = []

    for outcome in outcomes:
        outcome_node = SupportNode(outcome, forbidden_set=[outcome])
        add_markov_children(outcome_node, network, evidences=evidences, variables=variables,
                            subsetFunc=find_differing_set, nodes=states)  #find_changed_set)  # , subsetFunc=find_smallest_set)
        deleteUseless(outcome_node, network, evidences, variables, most_relevant_nodes)
        rootNodes.append(outcome_node)

        for node in PreOrderIter(outcome_node):
            nodes.append(node.name)
            for child in node.children:
                edges.append([child.name, node.name])

    nodes = list(set(nodes))
    reduced_edges = []
    [reduced_edges.append(edge) for edge in edges if edge not in reduced_edges]

    obj_edges = [{"source": edge[0], "target": edge[1]} for edge in reduced_edges]

    return {"nodes": nodes, "edges": obj_edges}
