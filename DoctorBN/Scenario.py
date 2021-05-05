from Patient import Patient
from Network import Network
from pgmpy import inference

from TargetNode import TargetNode


class Scenario:
    targets = []

    def __init__(self, name, evidences=None):
        if evidences is None:
            self.patient = Patient()
        else:
            self.patient = Patient(evidences)

        self.network = Network(name)

    #adds a target node
    def add_target(self, name):
        self.targets.append(TargetNode(name))

    #adds multiple targets
    def add_target_list(self, list):
        for name in list:
            self.targets.append(TargetNode(name))

    #computes the values for the targets
    def compute_targets(self):
        infer = inference.VariableElimination(self.network.model)

        for t in self.targets:
            t.distribution = infer.query([t.name], evidence=self.patient.get_active_evidences())

    def print_targets(self):
        for t in self.targets:
            print(str(t))
