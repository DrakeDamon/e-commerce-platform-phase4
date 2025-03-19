Copyfrom flask import request, session, jsonify
from flask_restful import Resource

from config import app, db, api
from models import User, Product, Category, ProductCategory, Order