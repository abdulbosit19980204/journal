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
        now = timezone.now()
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        current_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Total revenue (all completed transactions with positive amounts - TOP_UP type)
        total_revenue = WalletTransaction.objects.filter(
            transaction_type='TOP_UP',
            amount__gt=0
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        # Monthly revenue
        monthly_revenue = WalletTransaction.objects.filter(
            transaction_type='TOP_UP',
            amount__gt=0,
            created_at__gte=current_month_start
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        # Yearly revenue
        yearly_revenue = WalletTransaction.objects.filter(
            transaction_type='TOP_UP',
            amount__gt=0,
            created_at__gte=current_year_start
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        # Pending top-ups (from PaymentReceipt)
        pending_topups = PaymentReceipt.objects.filter(
            status='PENDING'
        ).aggregate(
            count=Count('id'),
            amount=Sum('amount')
        )
        
        # Active subscriptions (users with balance > 0)
        users_with_balance = User.objects.filter(balance__gt=0).count()
        
        return Response({
            'total_revenue': str(total_revenue),
            'monthly_revenue': str(monthly_revenue),
            'yearly_revenue': str(yearly_revenue),
            'pending_topups_count': pending_topups['count'] or 0,
            'pending_topups_amount': str(pending_topups['amount'] or Decimal('0')),
            'users_with_balance': users_with_balance
        })


class RevenueTrendView(APIView):
    permission_classes = [IsFinanceAdmin]
    
    def get(self, request):
        """Get monthly revenue trend for last 12 months"""
        now = timezone.now()
        trends = []
        
        for i in range(11, -1, -1):
            month_start = (now.replace(day=1) - timedelta(days=i*30)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
            
            revenue = WalletTransaction.objects.filter(
                transaction_type='TOP_UP',
                amount__gt=0,
                created_at__gte=month_start,
                created_at__lte=month_end
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
            
            trends.append({
                'month': month_start.strftime('%Y-%m'),
                'revenue': str(revenue)
            })
        
        return Response(trends)


class TopUsersView(APIView):
    permission_classes = [IsFinanceAdmin]
    
    def get(self, request):
        """Get top 10 users by balance"""
        top_users = User.objects.filter(balance__gt=0).order_by('-balance')[:10]
        
        data = []
        for user in top_users:
            # Calculate total spent (sum of all negative transactions)
            total_spent = WalletTransaction.objects.filter(
                user=user,
                amount__lt=0
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
            
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
        breakdown = WalletTransaction.objects.values('transaction_type').annotate(
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
