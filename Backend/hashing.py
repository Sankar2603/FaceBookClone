from passlib.context import CryptContext

pwd_cxt = CryptContext(schemes=['argon2'],deprecated='auto')

class Hash:
    @staticmethod
    def argon2(password):
        return pwd_cxt.hash(password)
    
    @staticmethod
    def verify(hashed_password,plain_password):
        return pwd_cxt.verify(plain_password,hashed_password)
