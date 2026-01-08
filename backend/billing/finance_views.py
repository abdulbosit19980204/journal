from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .permissions import IsFinanceAdmin
from .models import WalletTransaction, PaymentReceipt
from users.models import User


class FinanceDashboardView(APIView):
    permission_classes = [IsFinanceAdmin]
    
    def get(self, request):
        """Get overview statistics for finance dashboard"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Base querysets
        tx_qs = WalletTransaction.objects.all()
        rc_qs = PaymentReceipt.objects.all()
        
        if start_date:
            tx_qs = tx_qs.filter(created_at__gte=start_date)
            rc_qs = rc_qs.filter(created_at__gte=start_date)
        if end_date:
            tx_qs = tx_qs.filter(created_at__lte=end_date)
            rc_qs = rc_qs.filter(created_at__lte=end_date)

        # Total revenue (TOP_UP type)
        total_revenue = tx_qs.filter(
            transaction_type='TOP_UP',
            amount__gt=0
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        # Pending top-ups
        pending_topups = rc_qs.filter(
            status='PENDING'
        ).aggregate(
            count=Count('id'),
            amount=Sum('amount')
        )
        
        # Users with balance (Not date-filtered as it's a current state)
        users_with_balance = User.objects.filter(balance__gt=0).count()
        
        return Response({
            'total_revenue': str(total_revenue),
            'pending_topups_count': pending_topups['count'] or 0,
            'pending_topups_amount': str(pending_topups['amount'] or Decimal('0')),
            'users_with_balance': users_with_balance
        })


class RevenueTrendView(APIView):
    permission_classes = [IsFinanceAdmin]
    
    def get(self, request):
        """Get monthly revenue trend"""
        # For trend we usually want a longer period, but respect filters if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        qs = WalletTransaction.objects.filter(transaction_type='TOP_UP', amount__gt=0)
        
        if start_date:
            qs = qs.filter(created_at__gte=start_date)
        if end_date:
            qs = qs.filter(created_at__lte=end_date)
            
        # Group by month and sum
        from django.db.models.functions import TruncMonth
        trends = qs.annotate(month=TruncMonth('created_at')).values('month').annotate(
            revenue=Sum('amount')
        ).order_by('month')
        
        data = []
        for item in trends:
            data.append({
                'month': item['month'].strftime('%Y-%m'),
                'revenue': str(item['revenue'])
            })
        
        return Response(data)


class TopUsersView(APIView):
    permission_classes = [IsFinanceAdmin]
    
    def get(self, request):
        """Get top 10 users by balance and activity in period"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Top users by current balance (independent of date)
        top_users = User.objects.filter(balance__gt=0).order_by('-balance')[:10]
        
        data = []
        for user in top_users:
            # Spent logic respect dates
            spent_qs = WalletTransaction.objects.filter(user=user, amount__lt=0)
            if start_date:
                spent_qs = spent_qs.filter(created_at__gte=start_date)
            if end_date:
                spent_qs = spent_qs.filter(created_at__lte=end_date)
                
            total_spent = spent_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0')
            
            data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'balance': str(user.balance),
                'total_spent': str(abs(total_spent))
            })
        
        return Response(data)


class TransactionBreakdownView(APIView):
    permission_classes = [IsFinanceAdmin]
    
    def get(self, request):
        """Get transaction breakdown by type"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        qs = WalletTransaction.objects.all()
        if start_date:
            qs = qs.filter(created_at__gte=start_date)
        if end_date:
            qs = qs.filter(created_at__lte=end_date)
            
        breakdown = qs.values('transaction_type').annotate(
            count=Count('id'),
            total=Sum('amount')
        )
        
        data = []
        for item in breakdown:
            data.append({
                'type': item['transaction_type'],
                'count': item['count'],
                'total': str(item['total'] or Decimal('0'))
            })
        
        return Response(data)
