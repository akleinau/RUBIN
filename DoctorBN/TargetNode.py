class TargetNode:
    name = ""
    distribution = None
    def __init__(self, name):
        self.name = name

    def get_value(self):
        if self.distribution is not None:
            return self.distribution.no_to_name[self.name][0]
        return -1

    def __str__(self):
        return self.name + ": " + self.get_value()