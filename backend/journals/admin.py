from django.contrib import admin
from .models import Journal, Issue

@admin.register(Journal)
class JournalAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'slug', 'is_paid', 'price_per_page', 'created_at')
    list_filter = ('is_paid',)
    search_fields = ('name_en', 'name_uz', 'name_ru')
    prepopulated_fields = {'slug': ('name_en',)}

@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('journal', 'volume', 'number', 'year', 'status')
    list_filter = ('status', 'journal')
    ordering = ('-year', '-volume', '-number')
