
class Patient:
    evidences = {}
    targets = []
    goals = {}


    def print_evidences(self):
        for e in self.evidences:
            print(self.evidences.get(e))


    def export_file(self):
        # ToDo
        raise NotImplementedError

    def import_file(self, file):
        # ToDo
        raise NotImplementedError
