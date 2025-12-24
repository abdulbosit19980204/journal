from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import SubscriptionPlan, UserSubscription, Invoice
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer, InvoiceSerializer

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

class SubscribeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        try:
            plan = SubscriptionPlan.objects.get(id=plan_id)
        except SubscriptionPlan.DoesNotExist:
            return Response({'error': 'Plan not found'}, status=404)

        # Create Invoice
        invoice = Invoice.objects.create(
            user=request.user,
            amount=plan.price,
            description=f"Subscription to {plan.name}",
            status='PENDING' # In real app, pending payment
        )
        
        # MOCK PAYMENT: Auto-approve for demo
        invoice.status = 'PAID'
        invoice.paid_at = timezone.now()
        invoice.save()

        # Update/Create Subscription
        UserSubscription.objects.update_or_create(
            user=request.user,
            defaults={
                'plan': plan,
                'start_date': timezone.now(),
                'end_date': timezone.now() + timedelta(days=30),
                'is_active': True
            }
        )

        return Response({'status': 'Subscribed successfully', 'invoice_id': invoice.id})
