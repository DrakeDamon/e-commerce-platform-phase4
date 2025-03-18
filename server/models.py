#hybrid_property allows for secure password handling
from sqlalchemy.ext.hybrid import hybrid_property
#turn db objects into dicts/json
from sqlalchemy_serializer import SerializerMixin
import json

#Grabs db from config
from config import db

class User(db.Model, SerializerMixin):
  __tablename__ = 'users'

  id = db.Column(db.Integer, primary_key=True)
  #nullable=false ensure a username is entered
  #unique=true ensure no 2 users are the same
  username = db.Column(db.String(15), nullable=False, unique=True)
  email = db.Column(db.String(50), nullable=False, unique=True)
  _password_hash = db.Column(db.String(15), nullable=False)
  address = db.Column(db.String(200))
  created_at = db.Column(db.DateTime, server_default=db.func.now())

  #Relationships
  #back_populates creates a relationship between Product and user
  #cascade happens when a user is deleted
  products = db.relationship('Product', back_populates='seller', cascade='all, delete-orphan')
  orders = db.relationship('Order', back_populates='buyer', cascade='all, delete-orphan')


