from rest_framework import serializers
from .models import SubscriptionPlan, UserSubscription, Invoice, SubscriptionHistory, PaymentReceipt, BillingConfig, WalletTransaction
from django.contrib.auth import get_user_model

User = get_user_model()

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    
    class Meta:
        model = UserSubscription
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'

class SubscriptionHistorySerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    
    class Meta:
        model = SubscriptionHistory
        fields = ['id', 'plan', 'plan_name', 'action', 'amount_paid', 'notes', 'created_at']

class PaymentReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentReceipt
        fields = '__all__'
        read_only_fields = ('user', 'status', 'processed_at')

class BillingConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingConfig
        fields = '__all__'

class AdminPaymentReceiptSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = PaymentReceipt
        fields = '__all__'
        read_only_fields = ('user', 'processed_at')


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ['id', 'amount', 'transaction_type', 'description', 'created_at']
