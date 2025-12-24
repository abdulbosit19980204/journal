from django.db import models
from django.utils import timezone

class AIConfiguration(models.Model):
    is_active = models.BooleanField(default=False)
    provider = models.CharField(max_length=50, default='openai', choices=(('openai','OpenAI'),('anthropic','Anthropic')))
    api_key = models.CharField(max_length=255, blank=True)
    model_name = models.CharField(max_length=100, default='gpt-4o')
    
    # Feature Flags
    enable_grammar_check = models.BooleanField(default=True)
    enable_plagiarism_check = models.BooleanField(default=False)
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"AI Config ({self.provider}) - {'Active' if self.is_active else 'Inactive'}"

    class Meta:
        verbose_name = "AI Configuration"
        verbose_name_plural = "AI Configurations"

    def save(self, *args, **kwargs):
        # Ensure singleton
        if not self.pk and AIConfiguration.objects.exists():
            return
        super().save(*args, **kwargs)
