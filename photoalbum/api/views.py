from rest_framework import viewsets, filters, permissions
from .models import Photo
from .serializers import PhotoSerializer, UserSerializer
from django.contrib.auth.models import User

class PhotoViewSet(viewsets.ModelViewSet):
    """
    Kezeli a fotók listázását, feltöltését és törlését.
    """
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['name', 'uploaded_at']
    ordering = ['-uploaded_at']

    def get_permissions(self):
        if self.action == 'destroy':
            # Require auth for delete
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_destroy(self, instance):
        instance.file.delete(save=False)
        instance.delete()

class UserRegistrationViewSet(viewsets.ModelViewSet):
    """
    Kezeli a regisztrációt (User létrehozása).
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # Regisztrálni bárki tud (különben nem lenne értelme)
    permission_classes = [permissions.AllowAny]
    # Csak a 'create' (POST) műveletet engedélyezzük ezen az útvonalon
    http_method_names = ['post']