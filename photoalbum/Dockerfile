FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
# Run migrations and start gunicorn
CMD ["gunicorn", "--bind", ":8080", "photoalbum.wsgi:application"]