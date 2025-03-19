from flask import request, session, jsonify
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


class UserById(Resource):
    def get(self, id):
        user = User.query.filter_by(id=id).first()
        
        if not user:
            return {'error': 'User not found'}, 404
            
        return user.to_dict(), 200
    
    def patch(self, id):
        user = User.query.filter_by(id=id).first()
        
        if not user:
            return {'error': 'User not found'}, 404
        
        data = request.get_json()
        
        for attr in data:
            if attr == 'password':
                user.password_hash = data[attr]
            elif hasattr(user, attr):
                setattr(user, attr, data[attr])
        
        db.session.commit()
        
        return user.to_dict(), 200
    
    def delete(self, id):
        user = User.query.filter_by(id=id).first()
        
        if not user:
            return {'error': 'User not found'}, 404
            
        db.session.delete(user)
        db.session.commit()
        
        return '', 204  

# Authentication Routes
class Login(Resource):
    def post(self):
        data = request.get_json()
        
        user = User.query.filter_by(username=data.get('username')).first()
        
        if not user or not user.check_password(data.get('password')):
            return {'error': 'Invalid username or password'}, 401
            
        session['user_id'] = user.id
        
        return user.to_dict(), 200

class Logout(Resource):
    def delete(self):
        session.pop('user_id', None)
        return {}, 204

class CheckSession(Resource):
    def get(self):
        user_id = session.get('user_id')
        
        if not user_id:
            return {'error': 'Not authorized'}, 401
            
        user = User.query.filter_by(id=user_id).first()
        
        if not user:
            return {'error': 'User not found'}, 404
            
        return user.to_dict(), 200     

      