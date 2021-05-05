from Scenario import Scenario

network = "endomcancerlast.bif"


evidences = {"PrimaryTumor": "grade_2", "p53": "mutant", "ER" : "negative"}
s = Scenario(network, evidences)
s.add_target("Therapy")
s.patient.add_evidences({"PrimaryTumor": "grade_1"})
s.compute_targets()

print(s.patient.evidences)
s.print_targets()
