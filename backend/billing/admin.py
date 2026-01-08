from django.contrib import admin
from .models import SubscriptionPlan, UserSubscription, Invoice, SubscriptionHistory, PaymentReceipt, BillingConfig, WalletTransaction
from django.utils import timezone

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'article_limit', 'is_active')
    list_filter = ('is_active',)

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active', 'plan')

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'amount', 'status', 'created_at')
    list_filter = ('status',)

@admin.register(BillingConfig)
class BillingConfigAdmin(admin.ModelAdmin):
    list_display = ('bank_name', 'card_number', 'card_holder')

@admin.register(PaymentReceipt)
class PaymentReceiptAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('user__username',)
    readonly_fields = ('created_at', 'processed_at')
    actions = ['approve_receipts', 'reject_receipts']

    def approve_receipts(self, request, queryset):
        for receipt in queryset.filter(status='PENDING'):
            receipt.user.balance += receipt.amount
            receipt.user.save()
            receipt.status = 'APPROVED'
            receipt.processed_at = timezone.now()
            receipt.save()
            
            # Record the transaction
            WalletTransaction.objects.create(
                user=receipt.user,
                amount=receipt.amount,
                transaction_type='TOP_UP',
                description=f"Balance top-up via approved receipt #{receipt.id}",
                receipt=receipt
            )
            
        self.message_user(request, "Selected receipts have been approved and balances updated.")
    approve_receipts.short_description = "Approve selected receipts and top up balances"

    def reject_receipts(self, request, queryset):
        queryset.filter(status='PENDING').update(
            status='REJECTED', 
            processed_at=timezone.now()
        )
        self.message_user(request, "Selected receipts have been rejected.")
    reject_receipts.short_description = "Reject selected receipts"

@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'transaction_type', 'description', 'created_at')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('user__username', 'description')
    readonly_fields = ('created_at',)
