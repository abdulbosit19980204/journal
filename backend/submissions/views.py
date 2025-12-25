from rest_framework import serializers, viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = '__all__'
        read_only_fields = ('author', 'submitted_at', 'created_at', 'updated_at')
    
    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username if obj.author else None

class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'abstract', 'keywords']

    def get_queryset(self):
        user = self.request.user
        queryset = Article.objects.all()

        # Filters
        status_filter = self.request.query_params.get('status')
        issue_id = self.request.query_params.get('issue')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if issue_id:
            queryset = queryset.filter(issue_id=issue_id)
            
        # Public: show published articles
        if status_filter == 'PUBLISHED':
            return queryset.filter(status='PUBLISHED')
        
        # List: authors see their own, admins see all
        if self.action == 'list':
            if user.is_staff or user.is_superuser:
                return queryset
            if user.is_authenticated:
                return queryset.filter(author=user)
            # Public fallback
            return queryset.filter(status='PUBLISHED')
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, status='SUBMITTED', submitted_at=timezone.now())

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Authors can only update their own submissions in certain statuses
        if instance.author == request.user and instance.status in ['DRAFT', 'SUBMITTED']:
            allowed_fields = ['title', 'abstract', 'keywords', 'status']
            data = {k: v for k, v in request.data.items() if k in allowed_fields}
            # Only allow withdrawal status change
            if 'status' in data and data['status'] != 'WITHDRAWN':
                del data['status']
            serializer = self.get_serializer(instance, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        # Editors can update any field
        elif request.user.is_staff:
            return super().partial_update(request, *args, **kwargs)
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['post'])
    def withdraw(self, request, pk=None):
        article = self.get_object()
        if article.author != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        if article.status in ['PUBLISHED', 'ACCEPTED']:
             return Response({'error': 'Cannot withdraw processed article'}, status=status.HTTP_400_BAD_REQUEST)
             
        article.status = 'WITHDRAWN'
        article.save()
        return Response({'status': 'Withdrawn'})

