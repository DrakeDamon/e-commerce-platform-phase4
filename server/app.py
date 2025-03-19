Copyfrom flask import request, session, jsonify
from flask_restful import Resource

from config import app, db, api
from models import User, Product, Category, ProductCategory, Order

# Root route for testing
@app.route('/')
def index():
    return '<h1>Stylish Clothing Store API</h1>'

# User Routes
class Users(Resource):
    def get(self):
        users = [user.to_dict() for user in User.query.all()]
        return users, 200
    
    def post(self):
        data = request.get_json()
        
        try:
            new_user = User(
                username=data['username'],
                email=data['email'],
                address=data.get('address', '')
            )
            new_user.password_hash = data['password']
            
            db.session.add(new_user)
            db.session.commit()
            
            session['user_id'] = new_user.id
            
            return new_user.to_dict(), 201
        
        except Exception as e:
            return {'error': str(e)}, 400