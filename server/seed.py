from app import app, db
from models import User, Category, Subcategory, Product, Order

def seed_data():
    with app.app_context():
        # Clear existing data in reverse order to avoid foreign key constraint violations
        Category.query.delete()
        Product.query.delete()
        Subcategory.query.delete()
        Category.query.delete()
        Order.query.delete()
        User.query.delete()
        db.session.commit()

        # Seed Admin User
        admin = User(
            username="admin",
            email="admin@thriftstore.com"
        )
        admin.password_hash = "adminpassword"
        db.session.add(admin)
        db.session.flush()

        # Seed Customer Users
        customers = [
            User(username="customer1", email="customer1@example.com"),
            User(username="customer2", email="customer2@example.com"),
        ]
        for customer in customers:
            customer.password_hash = "password123"
            db.session.add(customer)
        db.session.flush()

        # Seed Categories and Subcategories
        categories_data = [
            {
                "name": "Tops",
                "subcategories": ["Shirts", "Jackets"]
            },
            {
                "name": "Bottoms",
                "subcategories": ["Pants", "Shorts"]
            }
        ]

        categories = []
        subcategories_dict = {}
        for cat_data in categories_data:
            category = Category(name=cat_data["name"])
            db.session.add(category)
            db.session.flush()

            for sub_name in cat_data["subcategories"]:
                subcategory = Subcategory(name=sub_name, category_id=category.id)
                db.session.add(subcategory)
                db.session.flush()
                subcategories_dict[sub_name] = subcategory.id

            categories.append(category)

        # Seed Products (8 sportswear-related products)
        products = [
            Product(
                name="Classic White T-Shirt",
                description="Premium cotton t-shirt with a classic fit. Perfect for any casual occasion.",
                price=29.99,
                image_url="https://example.com/images/classic-white-tshirt.jpg",
                user_id=admin.id,
                subcategory_id=subcategories_dict["Shirts"],
                inventory_count=50
            ),
            Product(
                name="Athletic Workout Shirt",
                description="Lightweight button-down shirt made from 100% cotton. Great for casual or semi-formal occasions.",
                price=39.99,
                image_url="https://example.com/images/athletic-workout-shirt.jpg",
                user_id=admin.id,
                subcategory_id=subcategories_dict["Shirts"],
                inventory_count=40
            ),
            Product(
                name="Long Sleeve Dry Fit Shirt",
                description="Moisture-wicking long sleeve shirt for intense workouts.",
                price=44.99,
                image_url="https://example.com/images/long-sleeve-dry-fit-shirt.jpg",
                user_id=admin.id,
                subcategory_id=subcategories_dict["Shirts"],
                inventory_count=30
            ),
            Product(
                name="Joggers",
                description="Comfortable joggers with a tapered fit, perfect for running or casual wear.",
                price=49.99,
                image_url="https://example.com/images/joggers.jpg",
                user_id=admin.id,
                subcategory_id=subcategories_dict["Pants"],
                inventory_count=35
            ),
            Product(
                name="Sweatshirt",
                description="Warm and cozy sweatshirt for cool weather training.",
                price=54.99,
                image_url="https://example.com/images/sweatshirt.jpg",
                user_id=admin.id,
                subcategory_id=subcategories_dict["Jackets"],
                inventory_count=25
            ),
            Product(
                name="Ski Mask",
                description="Thermal ski mask for cold weather sports and outdoor activities.",
                price=19.99,
                image_url="https://example.com/images/ski-mask.jpg",
                user_id=admin.id,
                subcategory_id=subcategories_dict["Jackets"],
                inventory_count=60
            ),
            Product(
                name="Football Gloves",
                description="Grip-enhancing football gloves for better ball control.",
                price=34.99,
                image_url="https://example.com/images/football-gloves.jpg",
                user_id=admin.id,
                subcategory_id=subcategories_dict["Shirts"],
                inventory_count=20
            ),
            Product(
                name="Football Cleats",
                description="High-performance football cleats for optimal traction on the field.",
                price=89.99,
                image_url="https://example.com/images/football-cleats.jpg",
                user_id=admin.id,
                subcategory_id=subcategories_dict["Shorts"],
                inventory_count=15
            )
        ]

        for product in products:
            if product.name == "Classic White T-Shirt":
                product.set_sizes(["S", "M", "L", "XL"])
                product.set_colors(["White"])
            elif product.name == "Athletic Workout Shirt":
                product.set_sizes(["S", "M", "L"])
                product.set_colors(["White"])
            elif product.name == "Long Sleeve Dry Fit Shirt":
                product.set_sizes(["S", "M", "L", "XL"])
                product.set_colors(["Black", "Grey"])
            elif product.name == "Joggers":
                product.set_sizes(["S", "M", "L"])
                product.set_colors(["Black", "Navy"])
            elif product.name == "Sweatshirt":
                product.set_sizes(["M", "L", "XL"])
                product.set_colors(["Grey", "Blue"])
            elif product.name == "Ski Mask":
                product.set_sizes(["One Size"])
                product.set_colors(["Black"])
            elif product.name == "Football Gloves":
                product.set_sizes(["M", "L"])
                product.set_colors(["Red", "Black"])
            elif product.name == "Football Cleats":
                product.set_sizes(["8", "9", "10", "11"])
                product.set_colors(["White", "Black"])
            db.session.add(product)
        db.session.flush()

        # Seed Sample Orders for Customers
        orders = [
            Order(
                user_id=customers[0].id,
                status="completed",
                total_amount=69.98,  # Classic White T-Shirt + Athletic Workout Shirt
                shipping_address="123 Customer St, City, Country",
            ),
            Order(
                user_id=customers[1].id,
                status="pending",
                total_amount=49.99,  # Joggers
                shipping_address="456 Customer Ave, City, Country",
            )
        ]

        for order in orders:
            if order.user_id == customers[0].id:
                order.set_items([
                    {"product_id": products[0].id, "name": products[0].name, "quantity": 1, "price": products[0].price},
                    {"product_id": products[1].id, "name": products[1].name, "quantity": 1, "price": products[1].price}
                ])
            elif order.user_id == customers[1].id:
                order.set_items([
                    {"product_id": products[3].id, "name": products[3].name, "quantity": 1, "price": products[3].price}
                ])
            db.session.add(order)

        # Commit all changes
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_data()