from Scenario import Scenario


network = "endomcancerlast.bif"

#evidences={"Cytology": "yes", "CA125": "ge_35", "L1CAM": "positive", "PrimaryTumor": "grade_2"}
#evidences = {"p53": "mutant", "L1CAM": "positive", "CA125": "ge_35"}
evidences = {"PrimaryTumor": "grade_2", "p53": "mutant", "ER" : "negative"}
#evidences = {"PrimaryTumor": "grade_3"}
#evidences = {"L1CAM": "positive", "Cytology": "yes" }
s = Scenario(network, evidences)
s.add_target("Therapy")
s.patient.add_evidences({"PrimaryTumor": "grade_2"})
s.compute_targets()

s.patient.print_evidences()
s.print_targets()

relevancies = s.compute_relevancies_for_target("Therapy")
print(relevancies)

s.compute_explanation_of_target("Therapy", filename="hello.png")

