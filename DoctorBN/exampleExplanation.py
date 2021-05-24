from Scenario import Scenario


network = "endomcancerlast.bif"

evidences = {"PrimaryTumor": "grade_2", "p53": "mutant", "ER" : "negative"}
interventions = {"Therapy": "no"}
goals = {"Survival1yr": "yes", "Survival5yr": "yes"}

s = Scenario(network, evidences=evidences, goals=goals)

s.compute_explanation_of_goals(interventions=interventions, filename="hello.png")