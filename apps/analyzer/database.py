from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = db_url = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:password@postgres:5433/portfolio_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
