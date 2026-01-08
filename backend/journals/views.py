from rest_framework import viewsets, permissions, response
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Journal, Issue
from .serializers import JournalSerializer, IssueSerializer

class JournalViewSet(viewsets.ModelViewSet):
    queryset = Journal.objects.all()
    serializer_class = JournalSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()  # Required for router basename
    serializer_class = IssueSerializer
    
    def get_queryset(self):
        queryset = Issue.objects.all()
        journal_id = self.request.query_params.get('journal')
        if journal_id:
            queryset = queryset.filter(journal_id=journal_id)
        return queryset
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'years']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    @action(detail=False, methods=['get'])
    def years(self, request):
        years = Issue.objects.order_by('-year').values_list('year', flat=True).distinct()
        return Response(years)
