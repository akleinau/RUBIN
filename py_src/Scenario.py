from py_src.Patient import Patient
from py_src.Network import Network
from pgmpy import inference
import py_src.relevance as relevance
import py_src.explanation as explanation
import numpy as np
import py_src.sumNDimensionalArray as sumND

class Scenario:
    targets = []
    goals = {}

    def __init__(self, network, evidences=None, targets=None, goals=None):

        self.patient = Patient()

        self.network = Network(network)
        if evidences is not None: self.patient.evidences = evidences
        if targets is not None: self.patient.targets = targets
        if goals is not None: self.patient.goals = goals

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
            dimension = distribution.variables.index(goal)
            singleGoalDist = sumND.getMarginalProbability(distribution.values, dimension)
            goalValues[goal] = singleGoalDist[optionNum]

        return {'value': value, 'goalValues': goalValues}


    def compute_relevancies_for_goals(self):
        return relevance.get_influence_of_evidences_on_goals(self.network.model,
                                                             self.patient.evidences,
                                                             self.patient.goals)

    def compute_explanation_of_goals(self, interventions, most_relevant_nodes, nodes):
        return explanation.compute_explanation_of_target(self.network.model,
                                                         self.patient.evidences,
                                                         interventions,
                                                         self.patient.goals,
                                                         most_relevant_nodes,
                                                         nodes)


    def compute_target_combs_for_goals(self):
        #n = pow(2, len(self.patient.targets))
        results = []
        # clique-inspired: if A,B is worse then A, then A,B,C won't be better then AC
        # for i in range(1, n):
        #     chosenTargets = []
        #     value = i
        #     for target in self.patient.targets:
        #         if int(value%2) == 1: chosenTargets.append(target)
        #         value = value / 2

        #no clique for computation speed
        results = results + self.compute_target_for_goals(self.patient.targets)

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
                dimension = distribution.variables.index(goal)
                singleGoalDist = sumND.getMarginalProbability(distribution.values, dimension)
                goalValues[goal] = singleGoalDist[optionNum]

            results.append({'option': option, 'value': value, 'goalValues': goalValues})

        return results

    def compute_all_nodes(self):
        infer = inference.BeliefPropagation(self.network.model)
        nodes = []
        calcNodes = []
        for node in self.network.states:
            if node in self.patient.evidences:
                nodes.append({"name": node, "state": self.patient.evidences[node], "probability": 1})
            else:
                calcNodes.append(node)

        #this gives back as distribution.values an n-dim array with one dimension per calculated node
        #now we calculate the marginal probabilities per dimension to get the individual state probabilities of that node
        distribution = infer.query(calcNodes, evidence=self.patient.evidences)
        distribution_wo_evidence = infer.query(calcNodes)
        for node in calcNodes:
            dimension = distribution.variables.index(node)
            stateProbabilities = sumND.getMarginalProbability(distribution.values, dimension)
            dimension_wo_evidence = distribution_wo_evidence.variables.index(node)
            stateProbabilities_wo_evidence = sumND.getMarginalProbability(distribution_wo_evidence.values, dimension_wo_evidence)
            divergence = relevance.compute_jensen_shannon_divergence(stateProbabilities, stateProbabilities_wo_evidence)
            maxProbability = np.amax(stateProbabilities)
            state = np.where(stateProbabilities == maxProbability)[0][0]
            stateName = distribution.no_to_name[node][state]
            nodes.append({"name": node, "state": stateName, "probability": maxProbability, "divergence": divergence,
                          "distribution": list(stateProbabilities), "distribution_wo_evidence": list(stateProbabilities_wo_evidence)})

        return nodes