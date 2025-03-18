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
  

class Product(db.Model, SerializerMixin):
  #create product db table
  __tablename__ = 'products'

  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(100), nullable=False)
  description = db.Column(db.Text)
  price = db.Column(db.Float, nullable=False)
  inventory_count = db.Column(db.Integer, default= 0)
  image_url = db.Column(db.String(255))

  #clothing-specific attributes
  #store as JSON string
  available_sizes = db.Column(db.String(255))
  available_colors = db.Column(db.String(255))

  #foreign keys
  #connects to a specific user
  user_id = db.Column(db.Integer, db.ForeignKey('users-id'), nullable=False)

  #Relationships
  seller = db.relationship('User', back_populates='products')
  product_categories = db.relationship('ProductCategory', back_populates='products', cascade='all, delete-orphan')

  #Serialization rules
  serialize_rules = ('-seller.products', '-product_categories.product')

  #helper methods for JSON attributes
  #json.dumps takes list of sizes and turns it into a single string
  def set_sizes(self, sizes_list):
    self.available_sizes = json.dumps(sizes_list)

  #converts stored string and converts it into a list via json.loads or gives []
  def get_sizes(self):
    return json.loads(self.available_sizes) if self.available_sizes else []
  
  def set_colors(self, colors_list):
    self.available_colors = json.dumps(colors_list)

  def get_colors(self):
    return json.loads(self.available_colors) if self.available_colors else []



