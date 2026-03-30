from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Photo(models.Model):
    name = models.CharField(max_length=40)
    image = models.ImageField(upload_to='photos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='photos')
    
    def __str__(self):
        return f"{self.name} ({self.owner.username})"
    
    def delete(self, *args, **kwargs):
        if self.image:
            self.image.delete(save=False)
        super().delete(*args, **kwargs)

    class Meta:
        ordering = ['-uploaded_at']