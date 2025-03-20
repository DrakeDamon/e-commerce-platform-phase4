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
    username = db.Column(db.String(15), nullable=False, unique=True)
    email = db.Column(db.String(50), nullable=False, unique=True)
    _password_hash = db.Column(db.String(128), nullable=False)
    address = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationships
    products = db.relationship('Product', back_populates='seller', cascade='all, delete-orphan')
    orders = db.relationship('Order', back_populates='buyer', cascade='all, delete-orphan')

    # Serialization rules
    serialize_rules = ('-_password_hash', '-products.seller', '-orders.buyer')

    @hybrid_property
    def password_hash(self):
        raise AttributeError('Password hashes may not be viewed.')

    @password_hash.setter
    def password_hash(self, password):
        from werkzeug.security import generate_password_hash
        self._password_hash = generate_password_hash(password)

    def check_password(self, password):
        from werkzeug.security import check_password_hash
        return check_password_hash(self._password_hash, password)

class Product(db.Model, SerializerMixin):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    inventory_count = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(255))
    available_sizes = db.Column(db.String(255))
    available_colors = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subcategory_id = db.Column(db.Integer, db.ForeignKey('subcategories.id'))  # New field

    # Relationships
    seller = db.relationship('User', back_populates='products')
    product_categories = db.relationship('ProductCategory', back_populates='product', cascade='all, delete-orphan')
    subcategory = db.relationship('Subcategory', back_populates='products')

    # Serialization rules
    serialize_rules = ('-seller.products', '-product_categories.product', '-subcategory.products')

    # Helper methods for JSON attributes
    def set_sizes(self, sizes_list):
        self.available_sizes = json.dumps(sizes_list)

    def get_sizes(self):
        return json.loads(self.available_sizes) if self.available_sizes else []

    def set_colors(self, colors_list):
        self.available_colors = json.dumps(colors_list)

    def get_colors(self):
        return json.loads(self.available_colors) if self.available_colors else []

class Category(db.Model, SerializerMixin):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.Text)

    # Relationships (one to many)
    product_categories = db.relationship('ProductCategory', back_populates='category', cascade='all, delete-orphan')
    subcategories = db.relationship('Subcategory', back_populates='category', cascade='all, delete-orphan')

    # Serialization rules
    serialize_rules = ('-product_categories.category', '-subcategories.category')

class Subcategory(db.Model, SerializerMixin):
    __tablename__ = 'subcategories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)

    # Relationships
    category = db.relationship('Category', back_populates='subcategories')
    products = db.relationship('Product', back_populates='subcategory', cascade='all, delete-orphan')

    # Serialization rules
    serialize_rules = ('-category.subcategories', '-products.subcategory')

class ProductCategory(db.Model, SerializerMixin):
    __tablename__ = 'product_categories'
    
    id = db.Column(db.Integer, primary_key=True)
    featured = db.Column(db.Boolean, default=False)
    
    # Foreign Keys
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    
    # Relationships
    product = db.relationship('Product', back_populates='product_categories')
    category = db.relationship('Category', back_populates='product_categories')
    
    # Serialization rules
    serialize_rules = ('-product.product_categories', '-category.product_categories')

class Order(db.Model, SerializerMixin):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')
    total_amount = db.Column(db.Float, nullable=False)
    shipping_address = db.Column(db.String(255))
    items_json = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Relationships
    buyer = db.relationship('User', back_populates='orders')
    
    # Serialization rules
    serialize_rules = ('-buyer.orders',)
    
    # Helper methods for JSON attributes
    def set_items(self, items_list):
        self.items_json = json.dumps(items_list)
        
    def get_items(self):
        return json.loads(self.items_json) if self.items_json else []