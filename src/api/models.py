from flask_sqlalchemy import SQLAlchemy
from enum import Enum


db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }
    
class RoleEnum(Enum):

    PATIENT = "patient"
    DOCTOR = "doctor"
    MANAGER = "manager"

class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    country = db.Column(db.String(80), nullable=False)
    city = db.Column(db.String(80), nullable=False)
    role = db.Column(db.Enum(RoleEnum), nullable=False)

    
    doctors = db.relationship("Asociation", back_populates="patient")

    def __repr__(self):
        return f'<Patient {self.id}, {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email, 
            "first_name": self.first_name,
            "last_name": self.last_name,
            "country": self.country,
            "city": self.city,
            "role": self.role,
        }


class Doctor(db.Model):
    __tablename__ = 'doctors'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    country = db.Column(db.String(80), nullable=False)
    city = db.Column(db.String(80), nullable=False)
    speciality = db.Column(db.String(100), nullable=False)
    time_availability = db.Column(db.String(100), nullable=False)
    medical_consultant_price = db.Column(db.Float, nullable=False)
    role = db.Column(db.Enum(RoleEnum), nullable=False)

   
    patients = db.relationship("Asociation", back_populates="doctor")

    def __repr__(self):
        return f'<Doctor {self.id}, {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email, 
            "first_name": self.first_name,
            "last_name": self.last_name,
            "country": self.country,
            "city": self.city,
            "speciality": self.speciality,
            "time_availability": self.time_availability,
            "medical_consultant_price": self.medical_consultant_price,
            "role": self.role,
        }


class Manager(db.Model):  
    __tablename__ = 'managers'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.Enum(RoleEnum), nullable=False)

    def __repr__(self):
        return f'<Manager {self.id}, {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email, 
            "role": self.role
        }
class Asociation(db.Model):
    __tablename__ = 'asociations'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id")) 
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id"))    

    doctor = db.relationship("Doctor", back_populates="patients")
    patient = db.relationship("Patient", back_populates="doctors")


    def __repr__(self):
        return f'<Asociation {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id, 
            "doctor_id": self.doctor_id
        }

class TokenBlockedList(db.Model):
    __tablename__ = 'token_blocked_list'  
    
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(50), unique=True, nullable=False)

    def __repr__(self):
        return f'<TokenBlockedList {self.jti}>'

    def serialize(self):
        return {
            "id": self.id,
            "jti": self.jti,
        }