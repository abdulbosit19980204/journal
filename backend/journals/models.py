from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Journal(models.Model):
    name_en = models.CharField(max_length=255)
    name_uz = models.CharField(max_length=255, blank=True)
    name_ru = models.CharField(max_length=255, blank=True)
    description_en = models.TextField()
    description_uz = models.TextField(blank=True)
    description_ru = models.TextField(blank=True)
    slug = models.SlugField(unique=True)
    cover_image = models.ImageField(upload_to='journals/covers/', blank=True, null=True)
    
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_journals')
    
    is_paid = models.BooleanField(default=False)
    price_per_page = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name_en

class Issue(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
    )

    journal = models.ForeignKey(Journal, on_delete=models.CASCADE, related_name='issues')
    volume = models.IntegerField()
    number = models.IntegerField()
    year = models.IntegerField()
    published_at = models.DateField(blank=True, null=True)
    cover_image = models.ImageField(upload_to='issues/covers/', blank=True, null=True)
    file = models.FileField(upload_to='issues/files/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')

    class Meta:
        ordering = ['-year', '-volume', '-number']
        unique_together = ['journal', 'volume', 'number']

    def __str__(self):
        return f"{self.journal.name_en} - Vol {self.volume}, No {self.number} ({self.year})"
