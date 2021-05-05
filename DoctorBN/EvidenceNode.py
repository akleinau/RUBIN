class EvidenceNode:

    def __init__(self, name, value):
        self.name = name
        self.value = value
        self.hidden = False

    def __str__(self):
        return self.name + ": " + self.value