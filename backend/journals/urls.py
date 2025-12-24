from rest_framework.routers import DefaultRouter
from .views import JournalViewSet, IssueViewSet

router = DefaultRouter()
router.register(r'journals', JournalViewSet)
router.register(r'issues', IssueViewSet)

urlpatterns = router.urls
