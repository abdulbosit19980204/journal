from rest_framework.routers import SimpleRouter
from .views import JournalViewSet, IssueViewSet

router = SimpleRouter()
router.register(r'journals', JournalViewSet)
router.register(r'issues', IssueViewSet)

urlpatterns = router.urls
