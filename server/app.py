Copyfrom flask import request, session, jsonify
from flask_restful import Resource

from config import app, db, api
from models import User, Product, Category, ProductCategory, Order

# Root route for testing
@app.route('/')
def index():
    return '<h1>Stylish Clothing Store API</h1>'