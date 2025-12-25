from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanViewSet, MySubscriptionView, SubscribeView, SubscriptionHistoryView
from .payment_views import CreatePaymentView, AvailableGatewaysView, ClickCallbackView, PaymeCallbackView

router = DefaultRouter()
router.register(r'plans', PlanViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('billing/my-subscription/', MySubscriptionView.as_view(), name='my-subscription'),
    path('billing/subscribe/', SubscribeView.as_view(), name='subscribe'),
    path('billing/history/', SubscriptionHistoryView.as_view(), name='subscription-history'),
    # Payment endpoints
    path('billing/payment/create/', CreatePaymentView.as_view(), name='create-payment'),
    path('billing/payment/gateways/', AvailableGatewaysView.as_view(), name='available-gateways'),
    path('billing/payment/click/callback/', ClickCallbackView.as_view(), name='click-callback'),
    path('billing/payment/payme/callback/', PaymeCallbackView.as_view(), name='payme-callback'),
]
