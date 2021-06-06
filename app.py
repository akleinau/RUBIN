from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from py_src.Network import Network
from py_src.Scenario import Scenario
import os

NETWORK_FOLDER = './Networks'
ALLOWED_EXTENSIONS = ['.bif']
TEMPLATE_FOLDER = os.path.abspath('./src')
app = Flask(__name__, template_folder=TEMPLATE_FOLDER)
app.config['NETWORK_FOLDER'] = NETWORK_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///networks.db'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(app)
CORS(app)


@app.route('/getNetwork')
def getNetwork():
    data = request
    network = openNetwork(data.args.get('network'))
    return {'states': network.states, 'edges': network.edges}


@app.route('/calcTargetForGoals', methods=['POST'])
def calcTargetForGoals():
    data = request.get_json()
    network = getNetworkInDatabase(data['network']).filePath
    s = Scenario(network, evidences=data['evidences'], targets=data['target'], goals=data['goals'])
    results = s.compute_target_combs_for_goals()
    likely_results = s.compute_goals()
    return {'optionResults': results, 'likelyResults': likely_results}


#calculates the explanation of the chosen option
@app.route('/calcOptions', methods=['POST'])
def calcOptions():
    #data prep
    data = request.get_json()
    relevanceEvidences = {}
    for ev in data['evidences']:
        relevanceEvidences[ev] = data['evidences'][ev]
    for op in data['options']:
        relevanceEvidences[op] = data['options'][op]
    network = getNetworkInDatabase(data['network']).filePath

    #explanation calculation
    s = Scenario(network, evidences=relevanceEvidences, goals=data['goals'])
    nodes = s.compute_all_nodes()
    relevance = s.compute_relevancies_for_goals()
    most_relevant_nodes = list(map(lambda a: a['node_name'],
                                   filter(lambda n: n['overall_relevance'] >= 0.2 or n['node_name'] in data['options'].keys(),
                                          relevance)))
    explanation = s.compute_explanation_of_goals({}, most_relevant_nodes, nodes)

    return {'relevance': relevance, 'nodes': nodes, 'explanation': explanation}


def getNetworkInDatabase(network: str):
    """
    Queries the network name in the database and returns the corresponding entry
    :param network: network name
    :return: database entry
    """
    return NetworkData.query.get(network)


def openNetwork(selectedNet: str):
    """
    Opens a network based on the network name
    :param selectedNet: the network name as in the database
    :return: opened PGMPy network
    """
    network = getNetworkInDatabase(selectedNet)
    return Network(network.filePath)


# Database object
class NetworkData(db.Model):
    filePath = db.Column(db.String(), nullable=False)
    displayName = db.Column(db.String(), primary_key=True, nullable=False)
    description = db.Column(db.String(), nullable=True)

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


# def hasDescription(description):


# Adds a new network's data to the database and saves the file to the designated path
def addNetwork(file, path, name, des):
    newNetwork = NetworkData(filePath=path, displayName=name, description=des)
    db.session.add(newNetwork)
    db.session.commit()
    file.save(path)
    return 'successful'


# Loads the list of known networks to the application
# returns a python dict object
@app.route('/loadNetList')
def getNetworkList():
    networks = NetworkData.query.order_by(NetworkData.displayName).all()
    netList = {}
    for i, network in enumerate(networks):
        netList[i] = network.displayName
    return netList


# Save file upload from application
@app.route('/uploadNetwork', methods=["POST"])
def saveNetwork():
    displayName = request.form['displayName']
    file = request.files['file']
    description = request.form['netDescription']
    # if the display name the user entered is already in use, return with error
    if doesNetworkNameExist(displayName):
        return jsonify('error1')
    # get file name and path
    filename = secure_filename(file.filename)
    filePath = os.path.join(app.config['NETWORK_FOLDER'], filename)
    # if the file name of the uploaded network already exists in the networks folder, return with error
    if doesPathExist(filePath):
        return jsonify('error2')
    # add new network to database and save it
    addNetwork(file, filePath, displayName, description)
    return jsonify('successful')


"""
# Opens the network with requested ID and adds it to the dictionary of network objects.
# If there already exists a network object with the requested ID, the function simply returns.
@app.route('/openNetwork', methods=["POST"])
def openNetwork():
    selectedNetwork = request.get_json()
    if selectedNetwork not in NETWORKS.keys():
        network = NetworkData.query.get(selectedNetwork)
        path = network.filePath
        NETWORKS[selectedNetwork] = path
    return ''
"""


@app.route('/')
def home():
    return 'this is the flask backend'


if __name__ == '__main__':
    app.run(host='localhost', debug=True, port=5000)
