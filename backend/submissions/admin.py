from django.contrib import admin
from .models import Article, ArticleReview

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    # ... (unchanged)
    list_display = ('title', 'author', 'journal', 'status', 'language', 'submitted_at')
    list_filter = ('status', 'journal', 'language')
    search_fields = ('title', 'abstract', 'author__username', 'keywords')
    readonly_fields = ('submitted_at', 'created_at', 'updated_at')
    list_editable = ('status',)  # Allow changing status directly in list view
    ordering = ('-submitted_at',)
    date_hierarchy = 'submitted_at'
    
    fieldsets = (
        ('Article Info', {
            'fields': ('title', 'abstract', 'keywords', 'language')
        }),
        ('Relations', {
            'fields': ('author', 'journal')
        }),
        ('File', {
            'fields': ('manuscript_file',)
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('submitted_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_published', 'mark_as_accepted', 'mark_as_rejected', 'mark_as_under_review']
    
    @admin.action(description='Mark selected articles as PUBLISHED')
    def mark_as_published(self, request, queryset):
        updated = queryset.update(status='PUBLISHED')
        self.message_user(request, f'{updated} article(s) marked as PUBLISHED.')
    
    @admin.action(description='Mark selected articles as ACCEPTED')
    def mark_as_accepted(self, request, queryset):
        updated = queryset.update(status='ACCEPTED')
        self.message_user(request, f'{updated} article(s) marked as ACCEPTED.')
    
    @admin.action(description='Mark selected articles as REJECTED')
    def mark_as_rejected(self, request, queryset):
        updated = queryset.update(status='REJECTED')
        self.message_user(request, f'{updated} article(s) marked as REJECTED.')
    
    @admin.action(description='Mark selected articles as UNDER_REVIEW')
    def mark_as_under_review(self, request, queryset):
        updated = queryset.update(status='UNDER_REVIEW')
        self.message_user(request, f'{updated} article(s) marked as UNDER_REVIEW.')

@admin.register(ArticleReview)
class ArticleReviewAdmin(admin.ModelAdmin):
    list_display = ('article', 'expert', 'created_at')
    list_filter = ('created_at', 'expert')
    search_fields = ('article__title', 'expert__username', 'critique')
    readonly_fields = ('created_at',)
