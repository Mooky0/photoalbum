FROM python:3.11-slim
WORKDIR /app
# Renderen nem kell ODBC driver, mert visszatértünk Postgre-re!
RUN apt-get update && apt-get install -y libpq-dev gcc
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
# Migráció és indítás
CMD python manage.py migrate && gunicorn photo_album.wsgi:application --bind 0.0.0.0:8000