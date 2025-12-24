from django.contrib import admin
from .models import Article

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'journal', 'status', 'submitted_at')
    list_filter = ('status', 'journal', 'language')
    search_fields = ('title', 'abstract', 'author__username')
    readonly_fields = ('submitted_at', 'created_at', 'updated_at')
