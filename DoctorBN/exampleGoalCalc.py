from Scenario import Scenario


network = "endomcancerlast.bif"

#evidences={"Cytology": "yes", "CA125": "ge_35", "L1CAM": "positive", "PrimaryTumor": "grade_2"}
#evidences = {"p53": "mutant", "L1CAM": "positive", "CA125": "ge_35"}
evidences = {"PrimaryTumor": "grade_2", "p53": "mutant", "ER" : "negative"}
#evidences = {"PrimaryTumor": "grade_3"}
#evidences = {"L1CAM": "positive", "Cytology": "yes" }
target = ["Therapy"]
goal = {"Survival1yr": "yes", "Survival5yr": "yes"}
s = Scenario(network, evidences=evidences, targets=target, goals=goal)
results = s.compute_target_for_goals(target[0])

