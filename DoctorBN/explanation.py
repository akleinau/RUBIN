from pgmpy.models import BayesianModel
from pgmpy.readwrite import BIFReader
from pgmpy import inference
from anytree import NodeMixin, RenderTree
from anytree.exporter import DotExporter
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

    def print_tree(self):
        for pre, fill, node in RenderTree(self):
            treestr = u"%s%s" % (pre, node.name)
            print(treestr.ljust(8), node.forbidden_set if node.forbidden_set else "")


def find_changed_set(root, set, evidences, network):
    infer = inference.VariableElimination(network)
    reduced_set = []
    for item in set:
        if item in evidences.keys():
            reduced_set.append(item)
        else:
            withEvidence = infer.map_query([item], evidence=evidences)
            standard = infer.map_query([item])
            if withEvidence != standard:
                reduced_set.append(item)
    return reduced_set

# reduce markov blanket to smallest set of elements, that still gets the same classifications
def find_smallest_set(root, set, evidences, network):
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


def add_markov_children(root, network, evidences=None, subsetFunc=None):
    blanket = network.get_markov_blanket(root.name)

    # find smallest set of nodes
    cleanedBlanket = []
    for node in blanket:
        if node not in root.forbidden_set:
            cleanedBlanket.append(node)

    small_blanket = cleanedBlanket
    if subsetFunc:
        small_blanket = subsetFunc(root, cleanedBlanket, evidences, network)


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
        childparents = []
        for c in network.get_children(node):
            if root.name in network.get_parents(c):
                if c not in forbidden_set:
                    forbidden_set.append(c)

        if not evidences or node not in evidences.keys():
            sn = SupportNode(node, parent=root, forbidden_set=forbidden_set)
            add_markov_children(sn, network, evidences, subsetFunc)
        else:
            sn = SupportNode(node, parent=root)


def deleteUseless(root, network, evidences):
    # if root is evidence itself, don't delete
    if root.name in evidences.keys():
        return 1

    # if roots children are useless, delete them
    for c in root.children:
        deleteUseless(c, network, evidences)

    # if root is no evidence, but has no children, delete
    if not root.children:
        root.parent = None


def compute_explanation_of_target(network, evidences, target, filename=""):
    Therapy_Node = SupportNode("Therapy", forbidden_set=["Therapy"])
    add_markov_children(Therapy_Node, network, evidences=evidences,
                        subsetFunc=find_changed_set)  # , subsetFunc=find_smallest_set)
    deleteUseless(Therapy_Node, network, evidences)

    if filename != "":
        DotExporter(Therapy_Node).to_picture(filename)

    Therapy_Node.print_tree()
