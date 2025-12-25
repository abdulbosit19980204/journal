from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from submissions.models import Article
from .service import AIService


class AnalyzeSubmissionView(APIView):
    """Analyze an article submission with AI"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, submission_id):
        try:
            article = Article.objects.get(id=submission_id)
        except Article.DoesNotExist:
            return Response({'error': 'Article not found'}, status=404)

        # Analyze abstract and title
        text = f"{article.title}\n\n{article.abstract or ''}"
        analysis_result = AIService.analyze_text(text)
        
        return Response({
            'article_id': article.id,
            'article_title': article.title,
            **analysis_result
        })


class GenerateReviewView(APIView):
    """Generate AI-powered review summary for an article"""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, submission_id):
        try:
            article = Article.objects.get(id=submission_id)
        except Article.DoesNotExist:
            return Response({'error': 'Article not found'}, status=404)

        text = f"{article.title}\n\n{article.abstract or ''}"
        review_summary = AIService.generate_review_summary(text)
        
        return Response({
            'article_id': article.id,
            'article_title': article.title,
            **review_summary
        })


class CheckGrammarView(APIView):
    """Check grammar and spelling for text"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        text = request.data.get('text', '')
        
        if not text:
            return Response({'error': 'Text is required'}, status=400)
        
        result = AIService.check_grammar(text)
        return Response(result)


class AIStatusView(APIView):
    """Get AI service status"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        config = AIService.get_config()
        return Response({
            'is_active': config.is_active,
            'provider': config.provider,
            'has_api_key': bool(config.api_key),
            'grammar_check_enabled': config.enable_grammar_check,
        })
