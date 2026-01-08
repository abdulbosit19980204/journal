from rest_framework.permissions import BasePermission

class IsFinanceAdmin(BasePermission):
    """
    Custom permission to only allow finance admins to access financial data.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_finance_admin
