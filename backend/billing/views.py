from rest_framework import viewsets, permissions, status, views, parsers
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta
from .models import SubscriptionPlan, UserSubscription, Invoice, SubscriptionHistory, PaymentReceipt, BillingConfig
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer, InvoiceSerializer, SubscriptionHistorySerializer, PaymentReceiptSerializer, BillingConfigSerializer

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

        return Response({
            'status': 'Subscribed successfully',
            'new_balance': user.balance,
            'action': action
        })
