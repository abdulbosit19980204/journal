from rest_framework import viewsets, permissions, status, views, parsers
from rest_framework.response import Response
from django.contrib.auth import get_user_model
User = get_user_model()
from decimal import Decimal
from rest_framework.decorators import action
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db import transaction
from datetime import timedelta
from .models import SubscriptionPlan, UserSubscription, Invoice, SubscriptionHistory, PaymentReceipt, BillingConfig, WalletTransaction
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer, InvoiceSerializer, SubscriptionHistorySerializer, PaymentReceiptSerializer, BillingConfigSerializer, AdminPaymentReceiptSerializer, WalletTransactionSerializer

class PlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]

class MySubscriptionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sub = UserSubscription.objects.filter(user=request.user, is_active=True).first()
        if not sub:
            return Response({'status': 'No active subscription'}, status=404)
        return Response(UserSubscriptionSerializer(sub).data)

class SubscriptionHistoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        history = SubscriptionHistory.objects.filter(user=request.user)
        return Response(SubscriptionHistorySerializer(history, many=True).data)

class BillingConfigView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        config = BillingConfig.objects.first()
        if not config:
            # Create a default one if none exists (demo purposes)
            config = BillingConfig.objects.create(card_number="0000 0000 0000 0000", card_holder="Central Journal Admin")
        return Response(BillingConfigSerializer(config).data)

class PaymentReceiptViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

    def get_queryset(self):
        return PaymentReceipt.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AdminPaymentReceiptViewSet(viewsets.ModelViewSet):
    queryset = PaymentReceipt.objects.all().order_by('-created_at')
    serializer_class = AdminPaymentReceiptSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        receipt = self.get_object()
        if receipt.status != 'PENDING':
            return Response({'error': 'Receipt is already processed'}, status=400)

        with transaction.atomic():
            receipt.status = 'APPROVED'
            receipt.processed_at = timezone.now()
            receipt.admin_notes = request.data.get('admin_notes', '')
            receipt.save()

            # Update user balance
            user = receipt.user
            user.balance += receipt.amount
            user.save()

            # Record unified transaction
            WalletTransaction.objects.create(
                user=user,
                amount=receipt.amount,
                transaction_type='TOP_UP',
                description=f"Balance top-up via receipt #{receipt.id}",
                receipt=receipt
            )

        return Response({'status': 'Approved', 'new_balance': user.balance})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        receipt = self.get_object()
        if receipt.status != 'PENDING':
            return Response({'error': 'Receipt is already processed'}, status=400)

        receipt.status = 'REJECTED'
        receipt.processed_at = timezone.now()
        receipt.admin_notes = request.data.get('admin_notes', '')
        receipt.save()

        return Response({'status': 'Rejected'})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        import django.db.models as db_models
        stats = PaymentReceipt.objects.aggregate(
            total_approved=db_models.Sum('amount', filter=db_models.Q(status='APPROVED')),
            total_pending=db_models.Sum('amount', filter=db_models.Q(status='PENDING')),
            total_rejected=db_models.Sum('amount', filter=db_models.Q(status='REJECTED')),
        )
        return Response(stats)

    @action(detail=False, methods=['get'])
    def users_list(self, request):
        users = User.objects.all().order_by('-balance')
        data = [{
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'balance': str(u.balance),
            'is_staff': u.is_staff
        } for u in users]
        return Response(data)

    @action(detail=False, methods=['post'], url_path='adjust-balance')
    def adjust_balance(self, request):
        user_id = request.data.get('user_id')
        amount = request.data.get('amount')
        notes = request.data.get('notes', 'Manual adjustment')

        if not user_id or amount is None:
            return Response({'error': 'Missing user_id or amount'}, status=400)

        user = get_object_or_404(User, id=user_id)
        amount_val = Decimal(str(amount))
        user.balance += amount_val
        user.save()

        # Record unified transaction
        WalletTransaction.objects.create(
            user=user,
            amount=amount_val,
            transaction_type='ADJUSTMENT',
            description=notes
        )

        # Log in history/invoice if needed?
        # For now, just direct update as requested for admin ease.
        
        return Response({'status': 'Balance adjusted', 'new_balance': user.balance})

class SubscribeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        plan = get_object_or_404(SubscriptionPlan, id=plan_id)
        user = request.user

        if user.balance < plan.price:
            return Response({'error': 'Insufficient balance. Please top up your account.'}, status=400)

        # Deduct balance
        user.balance -= plan.price
        user.save()

        # Check existing subscription for upgrade/downgrade tracking
        existing_sub = UserSubscription.objects.filter(user=request.user).first()
        action = 'SUBSCRIBED'
        if existing_sub and existing_sub.plan:
            if existing_sub.plan.price < plan.price:
                action = 'UPGRADED'
            elif existing_sub.plan.price > plan.price:
                action = 'DOWNGRADED'
            else:
                action = 'RENEWED'

        # Create Invoice (marked as PAID immediately since deducted from balance)
        invoice = Invoice.objects.create(
            user=user,
            amount=plan.price,
            description=f"Subscription to {plan.name}",
            status='PAID',
            provider='INTERNAL_BALANCE',
            paid_at=timezone.now()
        )
        
        # Update/Create Subscription
        UserSubscription.objects.update_or_create(
            user=user,
            defaults={
                'plan': plan,
                'start_date': timezone.now(),
                'end_date': timezone.now() + timedelta(days=30),
                'is_active': True
            }
        )

        # Create History Record
        SubscriptionHistory.objects.create(
            user=user,
            plan=plan,
            action=action,
            amount_paid=plan.price,
            invoice=invoice,
            notes=f"Subscribed to {plan.name} plan via balance"
        )

        # Record unified transaction
        WalletTransaction.objects.create(
            user=user,
            amount=-plan.price, # Negative for deduction
            transaction_type='SUBSCRIPTION',
            description=f"Subscription to {plan.name}",
            invoice=invoice
        )

        return Response({
            'status': 'Subscribed successfully',
            'new_balance': user.balance,
            'action': action
        })

class TransactionHistoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Fetch WalletTransactions (Completed balance movements)
        wallets = WalletTransaction.objects.filter(user=user).order_by('-created_at')
        
        # 2. Fetch PaymentReceipts that are NOT Approved (already in WalletTransaction)
        # or show all but label them. Actually, Approved ones are duplicated if we show both.
        # Let's show: All WalletTransactions + Pending/Rejected Receipts.
        receipts = PaymentReceipt.objects.filter(user=user).exclude(status='APPROVED').order_by('-created_at')
        
        history = []
        
        # Normalize WalletTransactions
        for tx in wallets:
            history.append({
                'id': f"TRX-{tx.id}",
                'amount': str(tx.amount),
                'type': tx.transaction_type,
                'description': tx.description,
                'status': 'COMPLETED',
                'created_at': tx.created_at
            })
            
        # Normalize Receipts
        for rc in receipts:
            history.append({
                'id': f"RCP-{rc.id}",
                'amount': str(rc.amount),
                'type': 'TOP_UP',
                'description': "Balance Top-Up (Verification)",
                'status': rc.status,
                'created_at': rc.created_at
            })
            
        # Sort by date
        history.sort(key=lambda x: x['created_at'], reverse=True)
        
        return Response(history)
