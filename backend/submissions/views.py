from django.db import models
from rest_framework import serializers, viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Article, ArticleReview

class ArticleReviewSerializer(serializers.ModelSerializer):
    expert_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ArticleReview
        fields = ('id', 'article', 'expert', 'expert_name', 'critique', 'created_at')
        read_only_fields = ('expert', 'created_at')

    def get_expert_name(self, obj):
        return obj.expert.get_full_name() or obj.expert.username

class ArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    journal_name = serializers.SerializerMethodField()
    journal_slug = serializers.SerializerMethodField()
    issue_info = serializers.SerializerMethodField()
    reviews = ArticleReviewSerializer(many=True, read_only=True)
    
    class Meta:
        model = Article
        fields = '__all__'
        read_only_fields = ('author', 'submitted_at', 'created_at', 'updated_at')
    
    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username if obj.author else None

    def get_journal_name(self, obj):
        return obj.journal.name_en if obj.journal else None

    def get_journal_slug(self, obj):
        return obj.journal.slug if obj.journal else None

    def get_issue_info(self, obj):
        if obj.issue:
            return {
                "id": obj.issue.id,
                "volume": obj.issue.volume,
                "number": obj.issue.number,
                "year": obj.issue.year
            }
        return None

class ArticleReviewViewSet(viewsets.ModelViewSet):
    queryset = ArticleReview.objects.all()
    serializer_class = ArticleReviewSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def perform_create(self, serializer):
        if not self.request.user.is_expert:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only expert users can write critiques.")
        
        # Check if user already reviewed this article
        article_id = self.request.data.get('article')
        if ArticleReview.objects.filter(article=article_id, expert=self.request.user).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You have already submitted a critique for this article.")
            
        serializer.save(expert=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.expert != request.user and not request.user.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to edit this critique.")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.expert != request.user and not request.user.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to delete this critique.")
        return super().destroy(request, *args, **kwargs)

    def get_queryset(self):
        article_id = self.request.query_params.get('article')
        if article_id:
            return self.queryset.filter(article_id=article_id)
        return self.queryset

class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'abstract', 'keywords', 'author__username', 'author__first_name', 'author__last_name']

    def get_queryset(self):
        user = self.request.user
        queryset = Article.objects.all()

        # Filters
        status_filter = self.request.query_params.get('status')
        issue_id = self.request.query_params.get('issue')
        journal_id = self.request.query_params.get('journal')
        author_id = self.request.query_params.get('author')
        author_name = self.request.query_params.get('author_name')
        lang = self.request.query_params.get('language')
        year = self.request.query_params.get('year')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if issue_id:
            queryset = queryset.filter(issue_id=issue_id)

        if journal_id:
            queryset = queryset.filter(journal_id=journal_id)
            
        if author_id:
            queryset = queryset.filter(author_id=author_id)

        if author_name:
            queryset = queryset.filter(
                models.Q(author__first_name__icontains=author_name) |
                models.Q(author__last_name__icontains=author_name) |
                models.Q(author__username__icontains=author_name)
            )
            
        if lang:
            queryset = queryset.filter(language=lang)
            
        if year:
            queryset = queryset.filter(issue__year=year)
            
        # Public: show published articles
        if status_filter == 'PUBLISHED':
            return queryset.filter(status='PUBLISHED').order_by('-submitted_at')
        
        # List: authors see their own, admins see all
        if self.action == 'list':
            if user.is_staff or user.is_superuser:
                return queryset
            if user.is_authenticated:
                return queryset.filter(author=user)
            # Public fallback
            return queryset.filter(status='PUBLISHED')
            
        return queryset

    def create(self, request, *args, **kwargs):
        user = request.user
        journal_id = request.data.get('journal')
        page_count = request.data.get('page_count', 0)
        
        try:
            page_count = int(page_count)
        except (ValueError, TypeError):
            page_count = 0

        journal = Journal.objects.get(id=journal_id)
        
        # 1. Check if user has an active subscription
        subscription = UserSubscription.objects.filter(user=user, is_active=True, end_date__gt=timezone.now()).first()
        
        needs_payment = False
        cost = Decimal('0.00')

        if subscription and subscription.plan:
            # Check limits
            if subscription.plan.article_limit > 0: # 0 means unlimited
                if subscription.articles_used_this_month >= subscription.plan.article_limit:
                    needs_payment = True
                    cost = journal.price_per_page * page_count
            else:
                # Unlimited plan
                pass
        else:
            # Free user or expired sub
            needs_payment = True
            cost = journal.price_per_page * page_count

        if needs_payment and cost > 0:
            if user.balance < cost:
                return Response({
                    'error': 'INSUFFICIENT_BALANCE',
                    'message': f'Insufficient balance. This publication costs ${cost}, but your balance is ${user.balance}.',
                    'cost': str(cost),
                    'balance': str(user.balance)
                }, status=status.HTTP_402_PAYMENT_REQUIRED)
            
            # Deduct balance
            user.balance -= cost
            user.save()
            
            # Record transaction
            WalletTransaction.objects.create(
                user=user,
                amount=-cost,
                transaction_type='PUBLISH_FEE',
                description=f"Publication fee for article in {journal.name_en}"
            )
        elif not needs_payment and subscription:
            # Increment usage for plan
            subscription.articles_used_this_month += 1
            subscription.save()

        return super().create(request, *args, **kwargs)

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

    @action(detail=True, methods=['get'])
    def certificate(self, request, pk=None):
        """
        Download Publication Certificate for the article.
        GET /api/submissions/{id}/certificate/?lang=uz|ru|en
        """
        article = self.get_object()
        
        # Only allow certificate for published articles
        if article.status != 'PUBLISHED':
             return Response(
                 {'error': 'Certificate is available only for published articles.'}, 
                 status=status.HTTP_400_BAD_REQUEST
             )
        
        # Public or Author? 
        # Usually public verification is fine, but download might be restricted?
        # Let's allow anyone to download the certificate for a PUBLISHED article.
        
        lang = request.query_params.get('lang', 'en')
        if lang not in ['en', 'ru', 'uz']:
            lang = 'en'
            
        from .certificate import generate_certificate_pdf
        from django.http import FileResponse
        
        buffer = generate_certificate_pdf(article, lang=lang)
        
        filename = f"Certificate_{article.id}_{lang}.pdf"
        response = FileResponse(buffer, as_attachment=True, filename=filename)
        return response

