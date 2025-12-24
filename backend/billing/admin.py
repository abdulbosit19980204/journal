from django.contrib import admin
from .models import SubscriptionPlan, UserSubscription, Invoice, SubscriptionHistory

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

@admin.register(SubscriptionHistory)
class SubscriptionHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'action', 'amount_paid', 'created_at')
    list_filter = ('action', 'plan')
    search_fields = ('user__username',)
