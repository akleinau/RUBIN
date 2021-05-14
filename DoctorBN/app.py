from flask import Flask, flash, request, redirect, jsonify, render_template, url_for
from flask_sqlalchemy import SQLAlchemy
from pgmpy.models import BayesianModel
from pgmpy.readwrite import BIFReader
from pgmpy import inference
from werkzeug.utils import secure_filename
from Network import Network
import os
import requests

NETWORK_FOLDER = './Networks'
ALLOWED_EXTENSIONS = ['.bif']
TEMPLATE_FOLDER = os.path.abspath('./src')

app = Flask(__name__, template_folder=TEMPLATE_FOLDER)
app.config['NETWORK_FOLDER'] = NETWORK_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///networks.db'
db = SQLAlchemy(app)



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


# Checks if user uploaded a file
def isFilePresent():
    if 'file' not in request.files:
        return True
    return False


# Checks if the file is non-empty
def isFileEmpty(filename):
    if filename == '':
        return True
    return False


# Returns the next network id available
def getNextId():
    return NetworkData.query.count()


# Adds a new network's data to the database and saves the file to the designated path
def addNetwork(file, path, name):
    newNetwork = NetworkData(netId = getNextId(), filePath = path, displayName = name)
    db.session.add(newNetwork)
    db.session.commit()
    file.save(path)
    return 'successful'


# Checks if filetype is in the list of allowed files
def allowed_file(filename: str):
    return '.' in filename and \
           filename.split('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# Loads the list of known networks to the application
# returns a python dict object
@app.route('/loadNetList')
def getNetworkList():
    if NetworkData.query.all() is not None:
        networks = NetworkData.query.order_by(NetworkData.netId).all()
        netList = {}
        for network in networks:
            netList[network.netId] = network.displayName
        return netList
    else:
        return {}


# Save file upload from application
@app.route('/uploadNetwork', methods=["POST"])
def saveNetwork():
    error = 'Error, try again'
    if request.method == "POST":
        # check if the post request has the file part
        if isFilePresent():
            return error
        file = request.files['file']
        # Check if file has a file name
        if isFileEmpty(file.filename):
            return error
        if file and allowed_file(file.filename):
            newDisplayName = request.form['net_name']
            # if the display name the user entered is already in use, return with error
            if doesNetworkNameExist(newDisplayName):
                return error
            # get file name and path
            filename = secure_filename(file.filename)
            filePath = os.path.join(app.config['NETWORK_FOLDER'], filename)
            # if the file name of the uploaded network already exists in the networks folder, return with error
            if doesPathExist(filePath):
                return error
            # add new network to database and save it
            return addNetwork(file, filePath, newDisplayName)
        # unexpected errors return
        else:
            return error


# TODO
@app.route('/openNetwork', methods=["GET", "POST"])
def openNetwork():
    netName = ''
    network = Network(netName)
    # render_template()


@app.route('/')
def home():
    render_template('App.vue')


if __name__ == '__main__':
    app.run(debug=True, port=5000)
