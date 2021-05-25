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
        infer = inference.BeliefPropagation(self.network.model)

        for t in self.patient.targets:
            node = self.patient.targets[t]
            node.distribution = infer.query([node.name], evidence=self.patient.evidences)

    # computes the values for the goals
    def compute_goals(self):
        infer = inference.BeliefPropagation(self.network.model)

        distribution = infer.query(list(self.patient.goals.keys()), evidence=self.patient.evidences)
        value = distribution.values
        goalValues = {}
        for i, goal in enumerate(distribution.variables):
            optionNum = distribution.name_to_no[goal][self.patient.goals[goal]]
            value = value[optionNum]
            singleGoalDist = infer.query([goal], evidence=self.patient.evidences)
            goalValues[goal] = singleGoalDist.values[singleGoalDist.name_to_no[goal][self.patient.goals[goal]]]

        return {'value': value, 'goalValues': goalValues}

    def print_targets(self):
        for t in self.patient.targets.keys():
            print(str(self.patient.targets[t]))

    def compute_relevancies_for_goals(self):
        return relevance.get_influence_of_evidences_on_goals(self.network.model,
                                                             self.patient.evidences,
                                                             self.patient.goals)

    def compute_explanation_of_goals(self, interventions):
        return explanation.compute_explanation_of_target(self.network.model,
                                                  self.patient.evidences,
                                                  interventions,
                                                  self.patient.goals)

    #clique-inspired: if A,B is worse then A, then A,B,C won't be better then AC
    def compute_target_combs_for_goals(self):
        n = pow(2, len(self.patient.targets))
        results = []
        for i in range(1, n):
            chosenTargets = []
            value = i
            for target in self.patient.targets:
                if int(value%2) == 1: chosenTargets.append(target)
                value = value / 2

            results = results + self.compute_target_for_goals(chosenTargets)

        results.sort(key=lambda a: a['value'], reverse=True)
        return results

    #compute_target_combs with just one target
    def compute_target_for_goals(self, targets):
        infer = inference.BeliefPropagation(self.network.model)

        states = []
        n = [1]
        #get dict with all states
        for target in targets:
            states.append({'name': target, 'states': self.network.states[target]})
            n.append(n[len(n)-1] * len(self.network.states[target]))

        results = []
        for i in range(n[len(n)-1]):
            goalNames = self.patient.goals.keys()
            simEvidence = self.patient.evidences.copy()
            option = {}

            index = i
            for j, target in sorted(enumerate(states), reverse=True):
                simEvidence[target['name']] = states[j]['states'][int(index/n[j])]
                option[target['name']] = states[j]['states'][int(index/n[j])]
                index = index%n[j]

            distribution = infer.query(list(goalNames), evidence=simEvidence)
            value = distribution.values
            goalValues = {}
            for i, goal in enumerate(distribution.variables):
                optionNum =distribution.name_to_no[goal][self.patient.goals[goal]]
                value = value[optionNum]
                singleGoalDist = infer.query([goal], evidence=simEvidence)
                goalValues[goal] = singleGoalDist.values[singleGoalDist.name_to_no[goal][self.patient.goals[goal]]]

            results.append({'option': option, 'value': value, 'goalValues': goalValues})

        return results

    def compute_all_nodes(self):
        infer = inference.BeliefPropagation(self.network.model)
        nodes = []
        for node in self.network.states:
            if node in self.patient.evidences:
                nodes.append({"name": node, "state": self.patient.evidences[node], "probability": 1})
            else:
                distribution = infer.query([node], evidence=self.patient.evidences)
                state = infer.map_query([node], evidence=self.patient.evidences)
                numberState = distribution.name_to_no[node][state[node]]
                nodes.append({"name": node, "state": state[node], "probability": distribution.values[numberState]})


        return nodes