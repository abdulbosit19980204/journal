from rest_framework import serializers, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'
        read_only_fields = ('author', 'status', 'submitted_at', 'created_at', 'updated_at')

class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Authors see own, Editors see journal's
        user = self.request.user
        if self.action == 'list':
            return Article.objects.filter(author=user)
        return Article.objects.all()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, status='SUBMITTED', submitted_at=timezone.now())

    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        article = self.get_object()
        if article.author != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        if article.status in ['PUBLISHED', 'ACCEPTED']:
             return Response({'error': 'Cannot withdraw processed article'}, status=status.HTTP_400_BAD_REQUEST)
             
        article.delete() # Or set status to WITHDRAWN
        return Response({'status': 'Withdrawn'})
