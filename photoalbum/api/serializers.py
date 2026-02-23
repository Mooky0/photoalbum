from rest_framework import serializers
from .models import Photo
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    # Regisztrációhoz szükséges serializer
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']

    def create(self, validated_data):
        # A jelszót titkosítva kell elmenteni!
        user = User.objects.create_user(**validated_data)
        return user
    
class PhotoSerializer(serializers.ModelSerializer):
    # A dátum formázása a feladat szerint: év-hó-nap óra:perc
    uploaded_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    
    # Csak olvasható mező, hogy lássuk, ki töltötte fel, de ne lehessen kézzel módosítani
    owner_name = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Photo
        fields = ['id', 'name', 'image', 'uploaded_at', 'owner_name']