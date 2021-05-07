from flask import Flask, request, jsonify
from pgmpy.models import BayesianModel
from pgmpy.readwrite import BIFReader
from pgmpy import inference

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///Database/networks'

@app.route('/')
def index():
    return render_template('')

def openNetwork(network_string: str):
    network = BIFReader.get_model(network_string)

