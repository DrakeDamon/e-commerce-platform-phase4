from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key_here'  
app.json.compact = False

#Ensures consistent naming database constraints
#Makes migrations more reliable
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})


#easy way for app to interact with db using python
db = SQLAlchemy(metadata=metadata)

#sets up db migrations so we can update db schema
migrate = Migrate(app, db)

#connects db to flask app
db.init_app(app)


#sets up Flask-RESTful for creating api endpoints
api = Api(app)

#allows front end to communicate with backend
CORS(app)