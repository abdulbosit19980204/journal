from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import RegisterView, MeView, UserViewSet, UserDetailView

router = SimpleRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('public/profiles/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('', include(router.urls)),
]
