from Patient import Patient
from Network import Network
from pgmpy import inference
import relevance
import explanation

from TargetNode import TargetNode


class Scenario:
    targets = []
    goals = {}

    def __init__(self, name, evidences=None, targets=None, goals=None):
        if evidences is None:
            self.patient = Patient()
        else:
            self.patient = Patient(evidences)

        self.network = Network(name)
        if targets is not None: self.targets = targets
        if goals is not None: self.goals = goals

    #adds a target node
    def add_target(self, name):
        self.targets[name] = (TargetNode(name))

    #adds multiple targets
    def add_target_list(self, list):
        for name in list:
            self.targets[name] = (TargetNode(name))

    #computes the values for the targets
    def compute_targets(self):
        infer = inference.VariableElimination(self.network.model)

        for t in self.targets.keys():
            node = self.targets[t]
            node.distribution = infer.query([node.name], evidence=self.patient.evidences)

    def print_targets(self):
        for t in self.targets.keys():
            print(str(self.targets[t]))

    def compute_relevancies_for_target(self, target):
        return relevance.get_influence_of_evidences_on_target(self.network.model,
                                                             self.patient.evidences,
                                                             self.targets[target])

    def compute_explanation_of_target(self, target, filename=""):
        explanation.compute_explanation_of_target(self.network.model,
                                                  self.patient.evidences,
                                                  self.targets[target],
                                                  filename=filename)

    #clique-inspired: if A,B is worse then A, then A,B,C won't be better then AC
    def compute_target_combs_for_goals(self):
        raise NotImplementedError

    #compute_target_combs with just one target
    def compute_target_for_goals(self, target):
        infer = inference.BeliefPropagation(self.network.model)
        results = []
        for option in self.network.states[target]:
            goalNames = self.goals.keys()
            simEvidence = self.patient.evidences.copy()
            simEvidence[target] = option
            distribution = infer.query(list(goalNames), evidence=simEvidence)
            value = distribution.values
            for goal in distribution.variables:
                value = value[distribution.name_to_no[goal][self.goals[goal]]]

            results.append({'option': option, 'value': value})

        results.sort(key=lambda a: a['value'], reverse=True)
        return results