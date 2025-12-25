"""
Payment API views for handling payments via Click and Payme
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
import json

from .gateways import PaymentRequest
from .gateways.click import ClickGateway
from .gateways.payme import PaymeGateway
from .models import Invoice, UserSubscription


class PaymentGatewayFactory:
    """Factory for creating payment gateway instances"""
    
    GATEWAYS = {
        'click': ClickGateway,
        'payme': PaymeGateway,
    }
    
    @classmethod
    def get_gateway(cls, provider: str):
        gateway_class = cls.GATEWAYS.get(provider.lower())
        if not gateway_class:
            raise ValueError(f"Unknown payment provider: {provider}")
        return gateway_class()
    
    @classmethod
    def available_gateways(cls):
        return list(cls.GATEWAYS.keys())


class CreatePaymentView(APIView):
    """Create a payment for an invoice"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        invoice_id = request.data.get('invoice_id')
        provider = request.data.get('provider', 'click')
        return_url = request.data.get('return_url', 'http://localhost:3000/dashboard/billing')
        
        if not invoice_id:
            return Response({'error': 'invoice_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            invoice = Invoice.objects.get(id=invoice_id, user=request.user)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if invoice.status == 'PAID':
            return Response({'error': 'Invoice already paid'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            gateway = PaymentGatewayFactory.get_gateway(provider)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        payment_request = PaymentRequest(
            amount=float(invoice.amount),
            currency='UZS',
            order_id=f"INV-{invoice.id}",
            description=invoice.description or f"Invoice #{invoice.id}",
            return_url=return_url,
            customer_email=request.user.email or '',
        )
        
        result = gateway.create_payment(payment_request)
        
        if result.success:
            invoice.payment_provider = provider
            invoice.transaction_id = result.transaction_id
            invoice.save()
            
            return Response({
                'success': True,
                'redirect_url': result.redirect_url,
                'transaction_id': result.transaction_id,
                'provider': provider
            })
        else:
            return Response({
                'success': False,
                'error': result.message
            }, status=status.HTTP_400_BAD_REQUEST)


class AvailableGatewaysView(APIView):
    """Get list of available payment gateways"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        gateways = [
            {
                'id': 'click',
                'name': 'Click.uz',
                'icon': '💳',
                'description': 'Pay with Click.uz'
            },
            {
                'id': 'payme',
                'name': 'Payme',
                'icon': '💰',
                'description': 'Pay with Payme'
            }
        ]
        return Response(gateways)


@method_decorator(csrf_exempt, name='dispatch')
class ClickCallbackView(APIView):
    """Handle Click.uz callbacks (Prepare/Complete)"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        gateway = ClickGateway()
        result = gateway.process_callback(request.data)
        
        if result.success:
            # Update invoice status if completed
            if result.status.value == 'completed':
                try:
                    invoice_id = result.transaction_id.replace('INV-', '')
                    invoice = Invoice.objects.get(id=invoice_id)
                    invoice.status = 'PAID'
                    invoice.save()
                    
                    # Activate subscription
                    if hasattr(invoice, 'subscription') and invoice.subscription:
                        invoice.subscription.is_active = True
                        invoice.subscription.save()
                except Invoice.DoesNotExist:
                    pass
            
            return Response(result.raw_response)
        else:
            return Response({
                'error': -1,
                'error_note': result.message
            })


@method_decorator(csrf_exempt, name='dispatch')
class PaymeCallbackView(APIView):
    """Handle Payme JSON-RPC callbacks"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        gateway = PaymeGateway()
        result = gateway.process_callback(request.data)
        
        if result.success:
            # Update invoice status if completed
            if result.status.value == 'completed':
                try:
                    invoice = Invoice.objects.filter(
                        transaction_id=result.transaction_id
                    ).first()
                    if invoice:
                        invoice.status = 'PAID'
                        invoice.save()
                        
                        # Activate subscription
                        if hasattr(invoice, 'subscription') and invoice.subscription:
                            invoice.subscription.is_active = True
                            invoice.subscription.save()
                except Exception:
                    pass
            
            return Response(result.raw_response)
        else:
            return Response({
                'error': {
                    'code': -31008,
                    'message': result.message
                }
            })
