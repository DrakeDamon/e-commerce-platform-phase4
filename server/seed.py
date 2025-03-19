#!/usr/bin/env python3

from app import app
from models import db, User, Product, Category, ProductCategory, Order
import json

def seed_database():
    #ensures we are working ith flask app context
    with app.app_context():
        print("Starting seed...")
        
        # Clear existing data in reverse order to avoid foreign key constraint violations
        ProductCategory.query.delete()
        Product.query.delete()
        Category.query.delete()
        Order.query.delete()
        User.query.delete()
        db.session.commit()

        # Create users
        print("Creating users...")
        user1 = User(
            username="admin",
            email="admin@stylish.com",
            address="123 Main St, Anytown, USA"
        )
        user1.password_hash = "password123"

        user2 = User(
            username="customer1",
            email="customer1@example.com",
            address="456 Oak St, Anytown, USA"
        )
        user2.password_hash = "password123"

        db.session.add_all([user1, user2])
        db.session.commit()

        # Create categories
        print("Creating categories...")
        all_category = Category(name="All", description="All clothing items")
        tops_category = Category(name="Tops", description="Shirts, T-shirts, and Jackets")
        bottoms_category = Category(name="Bottoms", description="Pants, shorts, and Sweats")

        db.session.add_all([all_category, tops_category, bottoms_category])
        db.session.commit()

        # Create products
        print("Creating products...")
        product1 = Product(
            name="Classic White T-Shirt",
            description="Premium cotton t-shirt with a classic fit. Perfect for any casual occasion.",
            price=29.99,
            inventory_count=50,
            image_url="https://via.placeholder.com/300x400",
            user_id=user1.id
        )
        product1.set_sizes(["S", "M", "L", "XL"])
        product1.set_colors(["White", "Black", "Navy", "Gray"])

        product2 = Product(
            name="Athletic Cotton Sweats",
            description="Comfortable slim fit jeans made with stretch denim. Perfect for everyday wear.",
            price=49.99,
            inventory_count=35,
            image_url="https://via.placeholder.com/300x400",
            user_id=user1.id
        )
        product2.set_sizes(["30", "32", "34", "36"])
        product2.set_colors(["Blue", "Black", "Gray"])

        product3 = Product(
            name="Athletic workout shirt",
            description="Lightweight button-down shirt made from 100% cotton. Great for casual or semi-formal occasions.",
            price=39.99,
            inventory_count=25,
            image_url="https://via.placeholder.com/300x400",
            user_id=user1.id
        )
        product3.set_sizes(["S", "M", "L", "XL"])
        product3.set_colors(["White", "Blue", "Pink"])

        db.session.add_all([product1, product2, product3])
        db.session.commit()

        # Create product-category associations
        #many to many relationship between products and categories
        print("Creating product-category associations...")
        pc1 = ProductCategory(product_id=product1.id, category_id=all_category.id, featured=True)
        pc2 = ProductCategory(product_id=product1.id, category_id=tops_category.id, featured=True)
        pc3 = ProductCategory(product_id=product2.id, category_id=all_category.id, featured=False)
        pc4 = ProductCategory(product_id=product2.id, category_id=bottoms_category.id, featured=True)
        pc5 = ProductCategory(product_id=product3.id, category_id=all_category.id, featured=False)
        pc6 = ProductCategory(product_id=product3.id, category_id=tops_category.id, featured=False)

        db.session.add_all([pc1, pc2, pc3, pc4, pc5, pc6])
        db.session.commit()

        # Create sample order
        print("Creating sample order...")
        order_items = [
            {
                "product_id": product1.id,
                "quantity": 2,
                "price_at_purchase": product1.price,
                "size": "M",
                "color": "White"
            },
            {
                "product_id": product2.id,
                "quantity": 1,
                "price_at_purchase": product2.price,
                "size": "32",
                "color": "Blue"
            }
        ]

        order = Order(
            user_id=user2.id,
            status="delivered",
            total_amount=109.97,
            shipping_address=user2.address,
        )
        order.set_items(order_items)

        db.session.add(order)
        db.session.commit()

        print("Database seeded!")

if __name__ == "__main__":
    seed_database()