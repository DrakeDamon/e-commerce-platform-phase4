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

  #Serialization/format rules
  # "-" means dont use
  serialize_rules = ('-_password_hash', '-products.seller', 'orders.buyer')


#hybrid_property allows password_hash to act like normal property to work in both code and db
  @hybrid_property
  def password_hash(self):
    raise AttributeError('Password hashes may not be viewed.')

 #tells python to scramble password
  @password_hash.setter
  def password_hash(self, password):
    from werkzeug.security  import generate_password_hash
    self._password_hash = generate_password_hash(password)

#checks if password matches stored hash
  def check_password(self, password):
    from werkzeug.security import check_password_hash
    return check_password_hash(self._password_hash, password)


