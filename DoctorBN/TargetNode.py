class TargetNode:
    name = ""
    distribution = None
    def __init__(self, name):
        self.name = name

    def get_value(self):
        if self.distribution is not None:
            max = 0
            id = -1
            for i, val in enumerate(self.distribution.values):
                if val > max:
                    max = val
                    id = i

            return self.distribution.no_to_name[self.name][id]
        return -1

    def __str__(self):
        return self.name + ": " + self.get_value()