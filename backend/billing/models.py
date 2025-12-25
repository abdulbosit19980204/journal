from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class SubscriptionPlan(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2) # Monthly price
    article_limit = models.IntegerField(default=0) # 0 = Unlimited
    description = models.TextField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} (${self.price})"

class UserSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    articles_used_this_month = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.plan.name}"

class Invoice(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='UZS')
    description = models.CharField(max_length=255)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    provider = models.CharField(max_length=50, blank=True) # e.g., 'click', 'payme'
    transaction_id = models.CharField(max_length=255, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Invoice #{self.id} - {self.amount} {self.currency}"


class SubscriptionHistory(models.Model):
    """Tracks all subscription changes for a user"""
    ACTION_CHOICES = (
        ('SUBSCRIBED', 'Subscribed'),
        ('RENEWED', 'Renewed'),
        ('UPGRADED', 'Upgraded'),
        ('DOWNGRADED', 'Downgraded'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscription_history')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Subscription histories'
    
    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.plan.name if self.plan else 'N/A'}"

class PaymentReceipt(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receipts')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    receipt_image = models.ImageField(upload_to='receipts/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Receipt {self.id} - {self.user.username} (${self.amount})"

class BillingConfig(models.Model):
    """Stores global billing settings like bank card info"""
    bank_name = models.CharField(max_length=255, default="Central Bank")
    card_number = models.CharField(max_length=255)
    card_holder = models.CharField(max_length=255)
    instructions_en = models.TextField(blank=True)
    instructions_uz = models.TextField(blank=True)
    instructions_ru = models.TextField(blank=True)

    def __str__(self):
        return "Global Billing Configuration"
    
    class Meta:
        verbose_name = "Billing Configuration"
        verbose_name_plural = "Billing Configuration"

class WalletTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('TOP_UP', 'Top Up'),
        ('SUBSCRIPTION', 'Subscription Payment'),
        ('ADJUSTMENT', 'Manual Adjustment'),
        ('PUBLISH_FEE', 'Publication Fee'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallet_transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional references for audit trail
    receipt = models.ForeignKey(PaymentReceipt, on_delete=models.SET_NULL, null=True, blank=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.amount}"
