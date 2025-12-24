from django.contrib import admin
from .models import AIConfiguration

@admin.register(AIConfiguration)
class AIConfigurationAdmin(admin.ModelAdmin):
    list_display = ('provider', 'is_active', 'enable_grammar_check', 'updated_at')
    
    def has_add_permission(self, request):
        # Singleton pattern - only allow one config
        if AIConfiguration.objects.exists():
            return False
        return True
    
    def has_delete_permission(self, request, obj=None):
        return False
