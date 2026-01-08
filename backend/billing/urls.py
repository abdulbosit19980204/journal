from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import PlanViewSet, MySubscriptionView, SubscribeView, SubscriptionHistoryView, BillingConfigView, PaymentReceiptViewSet, AdminPaymentReceiptViewSet, TransactionHistoryView
from .payment_views import CreatePaymentView, AvailableGatewaysView, ClickCallbackView, PaymeCallbackView
from .finance_views import FinanceDashboardView, RevenueTrendView, TopUsersView, TransactionBreakdownView

router = SimpleRouter()
router.register(r'plans', PlanViewSet)
router.register(r'receipts', PaymentReceiptViewSet, basename='receipt')
router.register(r'admin-receipts', AdminPaymentReceiptViewSet, basename='admin-receipt')

urlpatterns = [
    path('', include(router.urls)),
    path('billing/my-subscription/', MySubscriptionView.as_view(), name='my-subscription'),
    path('billing/subscribe/', SubscribeView.as_view(), name='subscribe'),
    path('billing/history/', SubscriptionHistoryView.as_view(), name='subscription-history'),
    path('billing/config/', BillingConfigView.as_view(), name='billing-config'),
    path('billing/transactions/', TransactionHistoryView.as_view(), name='transaction-history'),
    # Payment endpoints
    path('billing/payment/create/', CreatePaymentView.as_view(), name='create-payment'),
    path('billing/payment/gateways/', AvailableGatewaysView.as_view(), name='available-gateways'),
    path('billing/payment/click/callback/', ClickCallbackView.as_view(), name='click-callback'),
    path('billing/payment/payme/callback/', PaymeCallbackView.as_view(), name='payme-callback'),
    # Finance endpoints
    path('finance/dashboard/', FinanceDashboardView.as_view(), name='finance-dashboard'),
    path('finance/revenue-trend/', RevenueTrendView.as_view(), name='revenue-trend'),
    path('finance/top-users/', TopUsersView.as_view(), name='top-users'),
    path('finance/transaction-breakdown/', TransactionBreakdownView.as_view(), name='transaction-breakdown'),
]
