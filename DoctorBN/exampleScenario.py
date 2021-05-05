from Scenario import Scenario
import relevance

network = "endomcancerlast.bif"


evidences = {"PrimaryTumor": "grade_1", "p53": "mutant", "ER" : "negative"}
s = Scenario(network, evidences)
s.add_target("Therapy")
s.patient.add_evidences({"PrimaryTumor": "grade_2"})
s.compute_targets()

s.patient.print_evidences()
s.print_targets()

rel = relevance.get_influence_of_evidences_on_target(s.network,
                                               s.patient.get_active_evidences(),
                                               s.targets[0])

print(rel)