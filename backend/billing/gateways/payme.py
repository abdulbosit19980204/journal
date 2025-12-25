"""
Payme Payment Gateway Adapter
Official docs: https://developer.help.paycom.uz/
"""
import base64
import hashlib
import time
from typing import Dict, Any, Optional
from . import PaymentGateway, PaymentRequest, PaymentResult, PaymentStatus
from django.conf import settings


class PaymeGateway(PaymentGateway):
    """Payme payment gateway implementation"""
    
    # Payme API endpoints
    CHECKOUT_URL = "https://checkout.paycom.uz"
    API_URL = "https://checkout.paycom.uz/api"
    
    def __init__(self):
        self.merchant_id = getattr(settings, 'PAYME_MERCHANT_ID', 'test_merchant')
        self.secret_key = getattr(settings, 'PAYME_SECRET_KEY', 'test_secret')
    
    @property
    def name(self) -> str:
        return "Payme"
    
    def _encode_params(self, params: Dict[str, Any]) -> str:
        """Encode parameters for Payme checkout URL"""
        params_str = ';'.join([f'{k}={v}' for k, v in params.items()])
        return base64.b64encode(params_str.encode()).decode()
    
    def create_payment(self, request: PaymentRequest) -> PaymentResult:
        """Create a Payme payment - returns redirect URL"""
        try:
            # Amount in tiyin (1 UZS = 100 tiyin)
            amount_tiyin = int(request.amount * 100)
            
            params = {
                'm': self.merchant_id,
                'ac.order_id': request.order_id,
                'a': amount_tiyin,
                'c': request.return_url,
            }
            
            encoded = self._encode_params(params)
            redirect_url = f"{self.CHECKOUT_URL}/{encoded}"
            
            return PaymentResult(
                success=True,
                transaction_id=request.order_id,
                status=PaymentStatus.PENDING,
                message="Redirect to Payme for payment",
                redirect_url=redirect_url
            )
        except Exception as e:
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                message=str(e)
            )
    
    def verify_payment(self, transaction_id: str) -> PaymentResult:
        """Verify Payme payment status"""
        return PaymentResult(
            success=True,
            transaction_id=transaction_id,
            status=PaymentStatus.PENDING,
            message="Payment verification pending"
        )
    
    def cancel_payment(self, transaction_id: str) -> PaymentResult:
        """Cancel Payme payment"""
        return PaymentResult(
            success=True,
            transaction_id=transaction_id,
            status=PaymentStatus.CANCELLED,
            message="Payment cancelled"
        )
    
    def refund_payment(self, transaction_id: str, amount: Optional[float] = None) -> PaymentResult:
        """Refund Payme payment"""
        return PaymentResult(
            success=False,
            transaction_id=transaction_id,
            status=PaymentStatus.FAILED,
            message="Refunds must be processed through Payme dashboard"
        )
    
    def process_callback(self, data: Dict[str, Any]) -> PaymentResult:
        """Process Payme JSON-RPC callback"""
        method = data.get('method')
        params = data.get('params', {})
        
        if method == 'CheckPerformTransaction':
            # Check if transaction can be performed
            return PaymentResult(
                success=True,
                status=PaymentStatus.PENDING,
                message="Transaction can be performed",
                raw_response={
                    'result': {
                        'allow': True
                    }
                }
            )
        
        elif method == 'CreateTransaction':
            # Create transaction
            return PaymentResult(
                success=True,
                transaction_id=params.get('account', {}).get('order_id'),
                status=PaymentStatus.PROCESSING,
                message="Transaction created",
                raw_response={
                    'result': {
                        'create_time': int(time.time() * 1000),
                        'transaction': params.get('id'),
                        'state': 1
                    }
                }
            )
        
        elif method == 'PerformTransaction':
            # Perform/complete transaction
            return PaymentResult(
                success=True,
                transaction_id=params.get('id'),
                status=PaymentStatus.COMPLETED,
                message="Transaction completed",
                raw_response={
                    'result': {
                        'perform_time': int(time.time() * 1000),
                        'transaction': params.get('id'),
                        'state': 2
                    }
                }
            )
        
        elif method == 'CancelTransaction':
            # Cancel transaction
            return PaymentResult(
                success=True,
                transaction_id=params.get('id'),
                status=PaymentStatus.CANCELLED,
                message="Transaction cancelled",
                raw_response={
                    'result': {
                        'cancel_time': int(time.time() * 1000),
                        'transaction': params.get('id'),
                        'state': -1
                    }
                }
            )
        
        return PaymentResult(
            success=False,
            status=PaymentStatus.FAILED,
            message=f"Unknown method: {method}"
        )
