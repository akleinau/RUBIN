
class Patient:
    evidences = {}

    def __init__(self, evidences=None):
        if evidences is None:
            evidences = {}
        self.add_evidences(evidences)

    #add or update evidences
    def add_evidences(self, map):
        for name in map.keys():
            self.evidences[name] = map.get(name)

    def print_evidences(self):
        for e in self.evidences:
            print(self.evidences.get(e))


    def export_file(self):
        # ToDo
        raise NotImplementedError

    def import_file(self, file):
        # ToDo
        raise NotImplementedError
