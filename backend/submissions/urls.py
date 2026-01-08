from rest_framework.routers import SimpleRouter
from .views import SubmissionViewSet, ArticleReviewViewSet

router = SimpleRouter()
router.register(r'submissions', SubmissionViewSet, basename='submission')
router.register(r'reviews', ArticleReviewViewSet, basename='review')

urlpatterns = router.urls
