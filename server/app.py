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


# Product Routes
class Products(Resource):
    def get(self):
        category_name = request.args.get('category')
        search_term = request.args.get('search')
        
        # Start with all products
        query = Product.query
        
        # Filter by category if specified
        if category_name:
            category = Category.query.filter_by(name=category_name).first()
            if category:
                # Get product IDs from this category
                product_ids = [pc.product_id for pc in category.product_categories]
                query = query.filter(Product.id.in_(product_ids))
        
        # Filter by search term if specified
        if search_term:
            query = query.filter(Product.name.ilike(f'%{search_term}%') | 
                               Product.description.ilike(f'%{search_term}%'))
        
        # Get all filtered products
        products = [product.to_dict() for product in query.all()]
        return products, 200
    
    def post(self):
        data = request.get_json()
        
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'You must be logged in to create a product'}, 401
        
        try:
            new_product = Product(
                name=data['name'],
                description=data.get('description', ''),
                price=data['price'],
                inventory_count=data.get('inventory_count', 0),
                image_url=data.get('image_url', ''),
                user_id=user_id
            )
            
            # Set sizes and colors if provided
            if 'sizes' in data:
                new_product.set_sizes(data['sizes'])
                
            if 'colors' in data:
                new_product.set_colors(data['colors'])
            
            db.session.add(new_product)
            db.session.commit()
            
            # Add categories if provided
            if 'categories' in data:
                for category_id in data['categories']:
                    category = Category.query.get(category_id)
                    if category:
                        product_category = ProductCategory(
                            product_id=new_product.id,
                            category_id=category.id,
                            featured=data.get('featured', False)
                        )
                        db.session.add(product_category)
                
                db.session.commit()
            
            return new_product.to_dict(), 201
        
        except Exception as e:
            return {'error': str(e)}, 400

class ProductById(Resource):
    def get(self, id):
        product = Product.query.filter_by(id=id).first()
        
        if not product:
            return {'error': 'Product not found'}, 404
            
        return product.to_dict(), 200
    
    def patch(self, id):
        product = Product.query.filter_by(id=id).first()
        
        if not product:
            return {'error': 'Product not found'}, 404
        
        user_id = session.get('user_id')
        if not user_id or product.user_id != user_id:
            return {'error': 'You do not have permission to edit this product'}, 403
        
        data = request.get_json()
        
        # Update simple fields
        for attr in ['name', 'description', 'price', 'inventory_count', 'image_url']:
            if attr in data:
                setattr(product, attr, data[attr])
        
        # Update sizes and colors
        if 'sizes' in data:
            product.set_sizes(data['sizes'])
            
        if 'colors' in data:
            product.set_colors(data['colors'])
        
        db.session.commit()
        
        # Update categories if provided
        if 'categories' in data:
            # Clear existing categories
            ProductCategory.query.filter_by(product_id=product.id).delete()
            
            # Add new categories
            for category_id in data['categories']:
                category = Category.query.get(category_id)
                if category:
                    product_category = ProductCategory(
                        product_id=product.id,
                        category_id=category.id,
                        featured=data.get('featured', False)
                    )
                    db.session.add(product_category)
            
            db.session.commit()
        
        return product.to_dict(), 200
    
    def delete(self, id):
        product = Product.query.filter_by(id=id).first()
        
        if not product:
            return {'error': 'Product not found'}, 404
        
        user_id = session.get('user_id')
        if not user_id or product.user_id != user_id:
            return {'error': 'You do not have permission to delete this product'}, 403
            
        db.session.delete(product)
        db.session.commit()
        
        return '', 204  

# Category Routes
class Categories(Resource):
    def get(self):
        categories = [category.to_dict() for category in Category.query.all()]
        return categories, 200
    
    def post(self):
        data = request.get_json()
        
        try:
            new_category = Category(
                name=data['name'],
                description=data.get('description', '')
            )
            
            db.session.add(new_category)
            db.session.commit()
            
            return new_category.to_dict(), 201
        
        except Exception as e:
            return {'error': str(e)}, 400

class CategoryById(Resource):
    def get(self, id):
        category = Category.query.filter_by(id=id).first()
        
        if not category:
            return {'error': 'Category not found'}, 404
            
        return category.to_dict(), 200
    
    def patch(self, id):
        category = Category.query.filter_by(id=id).first()
        
        if not category:
            return {'error': 'Category not found'}, 404
        
        data = request.get_json()
        
        for attr in data:
            if hasattr(category, attr):
                setattr(category, attr, data[attr])
        
        db.session.commit()
        
        return category.to_dict(), 200
    
    def delete(self, id):
        category = Category.query.filter_by(id=id).first()
        
        if not category:
            return {'error': 'Category not found'}, 404
            
        db.session.delete(category)
        db.session.commit()
        
        return '', 204 
    
# ProductCategory Routes
class ProductCategories(Resource):
    def post(self):
        data = request.get_json()
        
        try:
            product_category = ProductCategory(
                product_id=data['product_id'],
                category_id=data['category_id'],
                featured=data.get('featured', False)
            )
            
            db.session.add(product_category)
            db.session.commit()
            
            return product_category.to_dict(), 201
        
        except Exception as e:
            return {'error': str(e)}, 400

class ProductCategoryById(Resource):
    def patch(self, id):
        product_category = ProductCategory.query.filter_by(id=id).first()
        
        if not product_category:
            return {'error': 'Product category not found'}, 404
        
        data = request.get_json()
        
        if 'featured' in data:
            product_category.featured = data['featured']
            
        db.session.commit()
        
        return product_category.to_dict(), 200
    
    def delete(self, id):
        product_category = ProductCategory.query.filter_by(id=id).first()
        
        if not product_category:
            return {'error': 'Product category not found'}, 404
            
        db.session.delete(product_category)
        db.session.commit()
        
        return '', 204
    
# Order Routes
class Orders(Resource):
    def get(self):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'You must be logged in to view orders'}, 401
        
        orders = [order.to_dict() for order in Order.query.filter_by(user_id=user_id)]
        return orders, 200
    
    def post(self):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'You must be logged in to create an order'}, 401
        
        data = request.get_json()
        
        try:
            new_order = Order(
                user_id=user_id,
                status='pending',
                total_amount=data['total_amount'],
                shipping_address=data.get('shipping_address', ''),
            )
            
            # Set order items
            if 'items' in data:
                new_order.set_items(data['items'])
            
            db.session.add(new_order)
            db.session.commit()
            
            return new_order.to_dict(), 201
        
        except Exception as e:
            return {'error': str(e)}, 400

class OrderById(Resource):
    def get(self, id):
        order = Order.query.filter_by(id=id).first()
        
        if not order:
            return {'error': 'Order not found'}, 404
        
        user_id = session.get('user_id')
        if not user_id or order.user_id != user_id:
            return {'error': 'You do not have permission to view this order'}, 403
            
        return order.to_dict(), 200
    
    def patch(self, id):
        order = Order.query.filter_by(id=id).first()
        
        if not order:
            return {'error': 'Order not found'}, 404
        
        user_id = session.get('user_id')
        if not user_id or order.user_id != user_id:
            return {'error': 'You do not have permission to update this order'}, 403
        
        data = request.get_json()
        
        # Update simple fields
        if 'status' in data:
            order.status = data['status']
            
        if 'shipping_address' in data:
            order.shipping_address = data['shipping_address']
            
        if 'total_amount' in data:
            order.total_amount = data['total_amount']
            
        # Update items if provided
        if 'items' in data:
            order.set_items(data['items'])
        
        db.session.commit()
        
        return order.to_dict(), 200

# Register resources
api.add_resource(Users, '/users')
api.add_resource(UserById, '/users/<int:id>')
api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')
api.add_resource(CheckSession, '/me')
api.add_resource(Products, '/products')
api.add_resource(ProductById, '/products/<int:id>')
api.add_resource(Categories, '/categories')
api.add_resource(CategoryById, '/categories/<int:id>')
api.add_resource(ProductCategories, '/product_categories')
api.add_resource(ProductCategoryById, '/product_categories/<int:id>')
api.add_resource(Orders, '/orders')
api.add_resource(OrderById, '/orders/<int:id>')

if __name__ == '__main__':
    app.run(port=5555, debug=True)

      