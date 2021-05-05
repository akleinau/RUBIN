from Patient import Patient
from Network import Network
from pgmpy import inference
import relevance

from TargetNode import TargetNode


class Scenario:
    targets = {}

    def __init__(self, name, evidences=None):
        if evidences is None:
            self.patient = Patient()
        else:
            self.patient = Patient(evidences)

        self.network = Network(name)

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
            node.distribution = infer.query([node.name], evidence=self.patient.get_active_evidences())

    def print_targets(self):
        for t in self.targets.keys():
            print(str(self.targets[t]))

    def compute_relevancies_for_target(self, target):
        return relevance.get_influence_of_evidences_on_target(self.network,
                                                             self.patient.get_active_evidences(),
                                                             self.targets[target])
