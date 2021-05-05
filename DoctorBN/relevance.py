import numpy
from scipy.spatial import distance
from pgmpy import inference
from TargetNode import TargetNode

class RelevanceOfEvidenceObject(object):
    def __init__(self, node_name, overall_relevance, relevancies,
                 resulting_in_max_state_change, max_state_with_current_evidence, max_state_without_current_evidence):
        self.node_name = node_name
        self.overall_relevance = overall_relevance
        self.relevancies = relevancies
        self.resulting_in_max_state_change = resulting_in_max_state_change
        self.max_state_with_current_evidence = max_state_with_current_evidence
        self.max_state_without_current_evidence = max_state_without_current_evidence


class RelevanceObject(object):
    def __init__(self, state, relevance):
        self.state = state
        self.relevance = relevance

#calculates the dissimilarity of two probability distributions (states) of a node
# == computes global relevance
def compute_jensen_shannon_divergence(distribution_1, distribution_2):
    p1 = []
    p2 = []

    for i in range(len(distribution_1.values)):
        p1.append(float(distribution_1.values[i]))
        p2.append(float(distribution_2.values[i]))

    jen_shan = distance.jensenshannon(p1, p2)

    if numpy.isnan(jen_shan):
        jen_shan = 0

    return jen_shan

#compute local relevances
def compute_relevancies_for_outcome_states(distribution_1, distribution_2):
    all_rel_objects_for_current_node = []

    for i in range(len(distribution_1.values)):
        name = list(distribution_1.no_to_name.keys())[0] ##get name of the target
        prob_diff = float(distribution_2.values[i]) - float(distribution_1.values[i]) #compute prob diff of each state
        rel_obj = RelevanceObject(state=distribution_1.no_to_name[name][i], relevance=prob_diff)

        all_rel_objects_for_current_node.append(rel_obj) #all states with their relevance difference


    return all_rel_objects_for_current_node


def get_influence_of_evidences_on_target(network, evidences, target):
    all_relevance_of_evidence_objects = []  # list with all evidences and their relevances
    infer = inference.VariableElimination(network)

    sum_of_all_overall_relevancies = 0  # jennsen-shannon relevances of all targets together

    for e in evidences.keys():

        rel_of_ev_obj = RelevanceOfEvidenceObject(node_name=e, overall_relevance=None, relevancies=None,
                                                      resulting_in_max_state_change=None,
                                                      max_state_with_current_evidence=None,
                                                      max_state_without_current_evidence=None)

        evidences_wo = {}
        for node in evidences.keys():
            if not node == e:
                evidences_wo[node] = evidences[node]

        distribution_wo = infer.query([target.name], evidence=evidences_wo)
        node_wo = TargetNode(target.name)
        node_wo.distribution = distribution_wo

        # global relevance
        jensen_shannon_value = compute_jensen_shannon_divergence(target.distribution,
                                                             distribution_wo)

        rel_of_ev_obj.overall_relevance = jensen_shannon_value
        sum_of_all_overall_relevancies += jensen_shannon_value

        # local relevance
        rel_of_ev_obj.relevancies = compute_relevancies_for_outcome_states(target.distribution,
                                                             distribution_wo)

        # compute if recommendation changer
        if (target.get_value() != node_wo.get_value()):
            rel_of_ev_obj.resulting_in_max_state_change = True
            rel_of_ev_obj.max_state_with_current_evidence = target.get_value()
            rel_of_ev_obj.max_state_without_current_evidence = node_wo.get_value()

        all_relevance_of_evidence_objects.append(rel_of_ev_obj)

    # make global relevance to percentage
    for i in range(len(all_relevance_of_evidence_objects)):
        new_overall_relevance_in_percentage = all_relevance_of_evidence_objects[i].overall_relevance / \
                                              sum_of_all_overall_relevancies

        if numpy.isnan(new_overall_relevance_in_percentage):
            new_overall_relevance_in_percentage = 0

        all_relevance_of_evidence_objects[i].overall_relevance = float(new_overall_relevance_in_percentage)


    return all_relevance_of_evidence_objects