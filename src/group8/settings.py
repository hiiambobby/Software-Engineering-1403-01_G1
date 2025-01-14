from secret import DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',  # or 'django.db.backends.postgresql', etc.
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST,
        'PORT': DB_PORT,
    }
}


