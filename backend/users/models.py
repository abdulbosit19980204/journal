from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom User model for Central Asian Journal Platform.
    Using Django's built-in groups for Author/Editor roles.
    """
    is_verified = models.BooleanField(default=False)
    bio = models.TextField(blank=True, null=True)
    institution = models.CharField(max_length=255, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)

    def __str__(self):
        return self.username
