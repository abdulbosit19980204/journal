from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_verified', 'is_finance_admin', 'is_expert', 'balance')
    list_filter = ('is_staff', 'is_superuser', 'is_verified', 'is_finance_admin', 'is_expert', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('is_verified', 'is_finance_admin', 'is_expert', 'balance', 'bio', 'institution', 'profile_picture')}),
    )
