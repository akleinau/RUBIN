from Patient import Patient
from Network import Network
from pgmpy import inference
import relevance
import explanation
import numpy as np

from TargetNode import TargetNode


class Scenario:
    targets = []
    goals = {}

    def __init__(self, name, evidences=None, targets=None, goals=None):

        self.patient = Patient()

        self.network = Network(name)
        if evidences is not None: self.patient.evidences = evidences
        if targets is not None: self.patient.targets = targets
        if goals is not None: self.patient.goals = goals

    #adds a target node
    def add_target(self, name):
        self.patient.targets[name] = (TargetNode(name))

    #adds multiple targets
    def add_target_list(self, list):
        for name in list:
            self.patient.targets[name] = (TargetNode(name))

    #computes the values for the targets
    def compute_targets(self):
        infer = inference.VariableElimination(self.network.model)

        for t in self.patient.targets.keys():
            node = self.patient.targets[t]
            node.distribution = infer.query([node.name], evidence=self.patient.evidences)

    def print_targets(self):
        for t in self.patient.targets.keys():
            print(str(self.patient.targets[t]))

    def compute_relevancies_for_target(self, target):
        return relevance.get_influence_of_evidences_on_target(self.network.model,
                                                             self.patient.evidences,
                                                             self.patient.targets[target])

    def compute_explanation_of_target(self, target, filename=""):
        explanation.compute_explanation_of_target(self.network.model,
                                                  self.patient.evidences,
                                                  self.patient.targets[target],
                                                  filename=filename)

    #clique-inspired: if A,B is worse then A, then A,B,C won't be better then AC
    def compute_target_combs_for_goals(self):
        raise NotImplementedError

    #compute_target_combs with just one target
    def compute_target_for_goals(self, target):
        infer = inference.BeliefPropagation(self.network.model)
        results = []
        for option in self.network.states[target]:
            goalNames = self.patient.goals.keys()
            simEvidence = self.patient.evidences.copy()
            simEvidence[target] = option
            distribution = infer.query(list(goalNames), evidence=simEvidence)
            value = distribution.values
            goalValues = {}
            for i, goal in enumerate(distribution.variables):
                optionNum =distribution.name_to_no[goal][self.patient.goals[goal]]
                value = value[optionNum]
                singleGoalDist = infer.query([goal], evidence=simEvidence)
                goalValues[goal] = singleGoalDist.values[singleGoalDist.name_to_no[goal][self.patient.goals[goal]]]

            results.append({'option': option, 'value': value, 'goalValues': goalValues})

        results.sort(key=lambda a: a['value'], reverse=True)
        return results