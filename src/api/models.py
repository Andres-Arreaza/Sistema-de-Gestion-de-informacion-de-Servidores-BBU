from flask_sqlalchemy import SQLAlchemy
from enum import Enum


db = SQLAlchemy()

# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     email = db.Column(db.String(120), unique=True, nullable=False)
#     password = db.Column(db.String(80), unique=False, nullable=False)
#     is_active = db.Column(db.Boolean(), unique=False, nullable=False)

#     def __repr__(self):
#         return f'<User {self.email}>'

#     def serialize(self):
#         return {
#             "id": self.id,
#             "email": self.email,
#             # do not serialize the password, its a security breach
#         }
    
class RoleEnum(Enum):

    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    MANAGER = "MANAGER"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    country = db.Column(db.String(80), nullable=False)
    city = db.Column(db.String(80), nullable=False)
    role = db.Column(db.Enum(RoleEnum), nullable=False)

    appointments = db.relationship("Appointment")

    def __repr__(self):
        return f'<User {self.id}, {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email, 
            "first_name": self.first_name,
            "last_name": self.last_name,
            "country": self.country,
            "city": self.city,
            "role": self.role.value,
        }


class Doctor(db.Model):
    __tablename__ = 'doctors'

    id = db.Column(db.Integer, primary_key=True)
    speciality = db.Column(db.String(100), nullable=False)
    time_availability = db.Column(db.String(100), nullable=False)
    medical_consultant_price = db.Column(db.Float, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id")) 
    users= db.relationship("User")
    appointments = db.relationship("Appointment")

    def __repr__(self):
        return f'<Doctor {self.id}>'

    def serialize(self):
        doctor=User.query.filter_by(id=self.user_id).first()
        return {
            "id": self.id,
            "info":doctor.serialize() if doctor else None,
            "speciality": self.speciality,
            "time_availability": self.time_availability,
            "medical_consultant_price": self.medical_consultant_price,
        }


class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("users.id")) 
    doctor_id = db.Column(db.Integer, db.ForeignKey("doctors.id"))    

    doctor = db.relationship("Doctor", back_populates="appointments")
    patient = db.relationship("User", back_populates="appointments")


    def __repr__(self):
        return f'<Appointment {self.id}>'

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