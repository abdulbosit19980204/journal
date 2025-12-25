from django.urls import path
from .views import AnalyzeSubmissionView, GenerateReviewView, CheckGrammarView, AIStatusView

urlpatterns = [
    path('analyze/<int:submission_id>/', AnalyzeSubmissionView.as_view(), name='analyze-submission'),
    path('review/<int:submission_id>/', GenerateReviewView.as_view(), name='generate-review'),
    path('grammar/', CheckGrammarView.as_view(), name='check-grammar'),
    path('status/', AIStatusView.as_view(), name='ai-status'),
]
