from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanViewSet, MySubscriptionView, SubscribeView

router = DefaultRouter()
router.register(r'plans', PlanViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('billing/my-subscription/', MySubscriptionView.as_view(), name='my-subscription'),
    path('billing/subscribe/', SubscribeView.as_view(), name='subscribe'),
]
