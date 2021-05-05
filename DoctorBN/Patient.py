class Patient:
    evidences = {}

    def __init__(self, evidences=None):
        if evidences is None:
            evidences = {}
        self.evidences = evidences

    #add or update evidences
    def add_evidences(self, map):
        for node in map.keys():
            self.evidences[node] = map.get(node)

    def export_file(self):
        # ToDo
        raise NotImplementedError

    def import_file(self, file):
        # ToDo
        raise NotImplementedError
