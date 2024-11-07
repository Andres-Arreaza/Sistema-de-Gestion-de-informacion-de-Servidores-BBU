from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# User Profile

class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(500), unique=False, nullable=False)
    first_name= db.Column(db.String(80), unique=False, nullable=False)
    last_name= db.Column(db.String(80), unique=False, nullable=False)
    country= db.Column(db.String(80), unique=False, nullable=False)
    city= db.Column(db.String(80), unique=False, nullable=False)
    address= db.Column(db.String(80), unique=False, nullable=False)
    photo=db.Column(db.String(200), unique=False, nullable=False)
    birthday=db.Column(db.Date(), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False, nullable=False)
    
    medicalProfile=db.relationship("MedicalProfile", backref="user", uselist=False, lazy=True)
    tokenBlockedList=db.relationship("TokenBlockedList", backref="user", lazy=True)

    def __repr__(self):
        return f'<User {self.id}, {self.email}, {self.first_name}, {self.last_name}>'

    def serialize(self):

        return{
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "country": self.country,
            "city": self.city, 
            "address": self.address,
            "photo":self.photo,
            "birthday": self.birthday,
            "is_active": self.is_active,
            "medical_profile": self.medicalProfile.serialize() if self.medicalProfile else None            
            }


# Medical Profile

class MedicalProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    specialty= db.Column(db.String(80), unique=False, nullable=False)
    university=db.Column(db.String(80), unique=False, nullable=False)
    time_availability=db.Column(db.String(80), unique=False, nullable=False)
    medical_consultation_price=db.Column(db.String(80), unique=False, nullable=False)

    user_id=db.Column(db.Integer, db.ForeignKey("user_profile.id"))

    def __repr__(self):
        return f'<User {self.id}>'

    def serialize(self):
        # user=UserProfile.query.filter_by(id=self.user_id).first()
        return{
            "id": self.id,
            "specialty": self.specialty,
            "university": self.university,
            "time_avaliability": self.time_availability,
            "medical_consultation_price": self.medical_consultation_price,
            # "user_profile":user.serialize() if user else None
        }


#TokenBlockedList con identificación del tipo de usuario (userProfile o MedicalProfile)

class TokenBlockedList(db.Model):
    id=db.Column(db.Integer, primary_key=True)
    jti=db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user_profile.id"))

    def __repr__(self):
        return f'TokenBlockedList {self.jti} for user_id {self.user_id}'

    def serialize(self):
        return {
            "id": self.id,
            "jti": self.jti,
            "user_id": self.user_id
        }
    
class Especialidades(db.Model):
    __tablename__ = 'especialidades' # Nombre de la tabla

    id = db.Column(db.Integer, primary_key=True) # ID clave primaria
    nombre = db.Column(db.String(120), unique=True, nullable=False) # Campo obligatorio para guardar la especialidad
    descripcion = db.Column(db.String(80), unique=False, nullable=True) # Campo opcional para describir la especialidad

    def __repr__(self):
        return f'<Especialidades {self.nombre}>'

    #Metodo para serializar, convertir el objeto en formato JSON
    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion

            # do not serialize the password, its a security breach
        }
    
class Doctors(db.Model):
    __tablename__ = 'doctors' # Nombre de la tabla

    id = db.Column(db.Integer, primary_key=True) # ID clave primaria
    doctor_name = db.Column(db.String(80), unique=False, nullable=False)
    
    especialidad_id = db.Column(db.Integer, db.ForeignKey('especialidades.id'), nullable=False) 
    speciality_id = db.relationship("Especialidades", backref="doctors")

    def __repr__(self):
        return f'<Doctors {self.doctor_name}>'

    #Metodo para serializar, convertir el objeto en formato JSON
    def serialize(self):
        return {
            "id": self.id,
            "doctor_name": self.doctor_name,
            "speciality_id": self.especiality_id

            # do not serialize the password, its a security breach
        }  