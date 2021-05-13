from flask import Flask, flash, request, redirect, jsonify, render_template, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from pgmpy.models import BayesianModel
from pgmpy.readwrite import BIFReader
from pgmpy import inference
from werkzeug.utils import secure_filename
from Network import Network
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
    return Network.getNodes("endomcancerlast.bif")

if __name__ == '__main__':
    app.run(debug=True, port=8080)

