from django.db import models
from django.contrib.auth import get_user_model
from journals.models import Journal, Issue

User = get_user_model()

class Article(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('PUBLISHED', 'Published'),
    )

    title = models.CharField(max_length=500)
    abstract = models.TextField()
    keywords = models.CharField(max_length=500, blank=True)
    
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    journal = models.ForeignKey(Journal, on_delete=models.CASCADE, related_name='articles')
    issue = models.ForeignKey(Issue, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles')
    
    manuscript_file = models.FileField(upload_to='submissions/manuscripts/') # PDF/DOCX
    page_count = models.IntegerField(default=0)
    language = models.CharField(max_length=10, default='en', choices=(('uz','Uzbek'),('ru','Russian'),('en','English')))
    rejection_reason = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.status})"
