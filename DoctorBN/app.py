from flask import Flask, flash, request, redirect, jsonify, render_template, url_for
from flask_sqlalchemy import SQLAlchemy
from pgmpy.models import BayesianModel
from pgmpy.readwrite import BIFReader
from pgmpy import inference
from werkzeug.utils import secure_filename
from DoctorBN.Network import Network
import os

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
        flash('Network name already exists', 'error')
        return redirect(url_for('/'))


# Checks if the file already exists in the path
def doesPathExist(filePath):
    if os.path.exists(filePath):
        flash('Filename already exists', 'error')
        return redirect(url_for('/'))


# Checks if user uploaded a file
def isFilePresent():
    if 'file' not in request.files:
        flash('No file part', 'error')
        return redirect(url_for('/'))


# Checks if the file is non-empty
def isFileEmpty(filename):
    if filename == '':
        flash('No selected file', 'error')
        return redirect(url_for('/'))


# Returns the next network id available
def getNextId():
    return NetworkData.query.count()


# Adds a new network's data to the database and saves the file to the designated path
def addNetwork(file, filePath, displayName):
    newNetwork = NetworkData(getNextId(), filePath, displayName)
    db.session.add(newNetwork)
    db.session.commit()
    file.save(filePath)
    flash('Network successfully uploaded', 'info')
    return redirect(url_for('/'))


# returns a python dict object
# key = network's ID number
# value = list, index 0 = filePath, index 1 = display name for the network
def getNetworkList():
    networks = NetworkData.query.order_by(NetworkData.netId).all()
    netList = []
    for network in networks:
        netList[network.netId] = [network.netId, network.filePath, network.displayName]
    return netList


# Checks if filetype is in the list of allowed files
def allowed_file(filename: str):
    return '.' in filename and \
           filename.split('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# TODO
@app.route('/', methods=["GET", "POST"])
def home():
    return render_template('App.vue', netList=getNetworkList())


# Save file upload from application
@app.route('/uploadNetwork', methods=["POST"])
def saveNetwork():
    if request.method == 'POST':
        # check if the post request has the file part
        isFilePresent()
        file = request.files['file']
        # Check if file has a file name
        isFileEmpty(file.filename)
        if file and allowed_file(file.filename):
            newDisplayName = request.form['net_name']
            # if the display name the user entered is already in use, return with error
            doesNetworkNameExist(newDisplayName)
            # get file name and path
            filename = secure_filename(file.filename)
            filePath = os.path.join(app.config['NETWORK_FOLDER'], filename)
            # if the file name of the uploaded network already exists in the networks folder, return with error
            doesPathExist(filePath)
            # add new network to database and save it
            addNetwork(file, filePath, newDisplayName)
        # unexpected errors return
        else:
            flash('unexpected error, try again', 'error')
            return redirect(url_for('/'))


# TODO
@app.route('/openNetwork', methods=["GET", "POST"])
def openNetwork():
    netName = ''
    network = Network(netName)
    # render_template()



if __name__ == '__main__':
    app.run(debug=True, port=8080)
