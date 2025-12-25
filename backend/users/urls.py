from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import RegisterView, MeView, UserViewSet

router = SimpleRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('', include(router.urls)),
]
