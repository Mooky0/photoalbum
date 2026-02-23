from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PhotoViewSet, UserRegistrationViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'photos', PhotoViewSet)
router.register(r'register', UserRegistrationViewSet)

urlpatterns = [
    # Az API végpontok (pl. /api/photos/)
    path('', include(router.urls)),
    
    # Bejelentkezés JWT token használatával (Modern REST megoldás)
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]