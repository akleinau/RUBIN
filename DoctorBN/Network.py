from pgmpy.readwrite import BIFReader

class Network:

    #reads the model in BIF format
    def __init__(self, name):
        reader = BIFReader(name)
        self.model = reader.get_model()

    def getNodes(name):
        reader = BIFReader(name)
        states = reader.get_states()
        return states

