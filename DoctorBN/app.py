from flask import Flask, flash, request, redirect, jsonify, make_response, render_template, url_for
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from pgmpy.models import BayesianModel
from pgmpy.readwrite import BIFReader
from pgmpy import inference
from werkzeug.utils import secure_filename
from Network import Network
from Scenario import Scenario
import os

NETWORK_FOLDER = './Networks'
ALLOWED_EXTENSIONS = ['.bif']
TEMPLATE_FOLDER = os.path.abspath('./src')
NETWORKS = {}
app = Flask(__name__, template_folder=TEMPLATE_FOLDER)
app.config['NETWORK_FOLDER'] = NETWORK_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///networks.db'
db = SQLAlchemy(app)
CORS(app)


@app.route('/cancernet')
def getCancerNet():
    data = request
    network = Network(NETWORKS[int(data.args.get('network'))])
    return {'states': network.states, 'edges': network.edges}

@app.route('/calcTargetForGoals', methods=['POST'])
def calcTargetForGoals():
    data = request.get_json()
    network = NETWORKS[int(data['network'])]
    s = Scenario(network, evidences=data['evidences'], targets=data['target'], goals=data['goals'])
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

    network = NETWORKS[int(data['network'])]
    s = Scenario(network, evidences=relevanceEvidences, goals=data['goals'])
    relevance = s.compute_relevancies_for_goals()
    nodes = s.compute_all_nodes()
    e = Scenario(network, evidences=data['evidences'], goals=data['goals'])
    explanation = e.compute_explanation_of_goals(data['options'])

    return {'relevance': relevance, 'nodes': nodes, 'explanation': explanation}


# Database object
class NetworkData(db.Model):
    netId = db.Column(db.Integer, primary_key=True)
    filePath = db.Column(db.String(), nullable=False)
    displayName = db.Column(db.String(30), nullable=False)

    def __repr__(self):
        return self.displayName


# checks if the network name passed on already exists
def doesNetworkNameExist(newDisplayName):
    if NetworkData.query.filter_by(displayName=newDisplayName).first() is not None:
        return True
    return False


# Checks if the file already exists in the path
def doesPathExist(filePath):
    if os.path.exists(filePath):
        return True
    return False


# Returns the next network id available
def getNextId():
    return NetworkData.query.count()


# Adds a new network's data to the database and saves the file to the designated path
def addNetwork(file, path, name):
    newNetwork = NetworkData(netId=getNextId(), filePath=path, displayName=name)
    db.session.add(newNetwork)
    db.session.commit()
    file.save(path)
    return 'successful'


# Loads the list of known networks to the application
# returns a python dict object
@app.route('/loadNetList')
def getNetworkList():
    networks = NetworkData.query.order_by(NetworkData.netId).all()
    netList = {}
    for network in networks:
        netList[network.netId] = network.displayName
    return netList


# Save file upload from application
@app.route('/uploadNetwork', methods=["POST"])
def saveNetwork():
    displayName = request.form['displayName']
    file = request.files['file']
    # if the display name the user entered is already in use, return with error
    if doesNetworkNameExist(displayName):
        return
    # get file name and path
    filename = secure_filename(file.filename)
    filePath = os.path.join(app.config['NETWORK_FOLDER'], filename)
    # if the file name of the uploaded network already exists in the networks folder, return with error
    if doesPathExist(filePath):
        return
    # add new network to database and save it
    addNetwork(file, filePath, displayName)
    return


# Opens the network with requested ID and adds it to the dictionary of network objects.
# If there already exists a network object with the requested ID, the function simply returns.
@app.route('/openNetwork', methods=["POST"])
def openNetwork():
    selectedNetwork = int(request.get_json())
    if selectedNetwork not in NETWORKS.keys():
        network = NetworkData.query.get(selectedNetwork)
        path = network.filePath
        NETWORKS[selectedNetwork] = path
    return ''


@app.route('/')
def home():
    render_template('App.vue')


if __name__ == '__main__':
    app.run(host='localhost', debug=True, port=5000)
