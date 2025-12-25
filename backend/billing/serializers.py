from rest_framework import serializers
from .models import SubscriptionPlan, UserSubscription, Invoice, SubscriptionHistory, PaymentReceipt, BillingConfig

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

