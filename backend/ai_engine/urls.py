from django.urls import path
from .views import AnalyzeSubmissionView

urlpatterns = [
    path('analyze/<int:submission_id>/', AnalyzeSubmissionView.as_view(), name='analyze_submission'),
]
