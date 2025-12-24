from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from submissions.models import Article
from .service import AIService

class AnalyzeSubmissionView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, submission_id):
        try:
            article = Article.objects.get(id=submission_id)
        except Article.DoesNotExist:
            return Response({'error': 'Article not found'}, status=404)

        # In real app, we would read article.manuscript_file or article.abstract
        analysis_result = AIService.analyze_text(article.abstract)
        
        return Response(analysis_result)
