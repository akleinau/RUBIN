from flask import Flask, flash, request, redirect, jsonify, render_template, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from pgmpy.models import BayesianModel
from pgmpy.readwrite import BIFReader
from pgmpy import inference
from werkzeug.utils import secure_filename
from Network import Network
from Scenario import Scenario
import os

NETWORK_FOLDER = './Networks'
ALLOWED_EXTENSIONS = ['.bif']

app = Flask(__name__)
CORS(app)
app.config['NETWORK_FOLDER'] = NETWORK_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///networks.db'
db = SQLAlchemy(app)


@app.route('/cancernet')
def getCancerNet():
    network = Network("endomcancerlast.bif")
    return {'states': network.states, 'edges': network.edges}

@app.route('/calcTargetForGoals', methods=['POST'])
def calcTargetForGoals():
    data = request.get_json()
    s = Scenario("endomcancerlast.bif", evidences=data['evidences'], targets=data['target'], goals=data['goals'])
    results = s.compute_target_combs_for_goals()
    likely_results = s.compute_goals()
    return {'optionResults': results, 'likelyResults': likely_results}

@app.route('/calcOptions', methods=['POST'])
def calcOptions():
    data = request.get_json()
    relevanceEvidences = {}
    for ev in data['evidences']:
        relevanceEvidences[ev] = data['evidences'][ev]
    for op in data['options']:
        relevanceEvidences[op] = data['options'][op]

    s = Scenario("endomcancerlast.bif", evidences=relevanceEvidences, goals=data['goals'])
    relevance = s.compute_relevancies_for_goals()
    nodes = s.compute_all_nodes()

    e = Scenario("endomcancerlast.bif", evidences=data['evidences'], goals=data['goals'])
    explanation = e.compute_explanation_of_goals(data['options'])

    return {'relevance': relevance, 'nodes': nodes, 'explanation': explanation}

if __name__ == '__main__':
    app.run(debug=True, port=8080)

