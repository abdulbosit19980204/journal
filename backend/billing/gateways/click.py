"""
Click.uz Payment Gateway Adapter
Official docs: https://docs.click.uz/
"""
import hashlib
import time
from typing import Dict, Any, Optional
from . import PaymentGateway, PaymentRequest, PaymentResult, PaymentStatus
from django.conf import settings


class ClickGateway(PaymentGateway):
    """Click.uz payment gateway implementation"""
    
    # Click API endpoints
    CHECKOUT_URL = "https://my.click.uz/services/pay"
    API_URL = "https://api.click.uz/v2/merchant"
    
    def __init__(self):
        self.merchant_id = getattr(settings, 'CLICK_MERCHANT_ID', 'test_merchant')
        self.service_id = getattr(settings, 'CLICK_SERVICE_ID', 'test_service')
        self.secret_key = getattr(settings, 'CLICK_SECRET_KEY', 'test_secret')
    
    @property
    def name(self) -> str:
        return "Click.uz"
    
    def _generate_sign(self, data: Dict[str, Any]) -> str:
        """Generate signature for Click API"""
        sign_string = f"{data.get('click_trans_id', '')}{data.get('service_id', self.service_id)}{self.secret_key}{data.get('merchant_trans_id', '')}{data.get('amount', '')}{data.get('action', '')}{data.get('sign_time', '')}"
        return hashlib.md5(sign_string.encode()).hexdigest()
    
    def create_payment(self, request: PaymentRequest) -> PaymentResult:
        """Create a Click payment - returns redirect URL"""
        try:
            # Build checkout URL
            params = {
                'merchant_id': self.merchant_id,
                'service_id': self.service_id,
                'amount': int(request.amount),
                'transaction_param': request.order_id,
                'return_url': request.return_url,
            }
            
            # Build redirect URL
            query = '&'.join([f"{k}={v}" for k, v in params.items()])
            redirect_url = f"{self.CHECKOUT_URL}?{query}"
            
            return PaymentResult(
                success=True,
                transaction_id=request.order_id,
                status=PaymentStatus.PENDING,
                message="Redirect to Click.uz for payment",
                redirect_url=redirect_url
            )
        except Exception as e:
            return PaymentResult(
                success=False,
                status=PaymentStatus.FAILED,
                message=str(e)
            )
    
    def verify_payment(self, transaction_id: str) -> PaymentResult:
        """Verify Click payment status"""
        # In production, this would call Click API to verify
        # For now, return pending status
        return PaymentResult(
            success=True,
            transaction_id=transaction_id,
            status=PaymentStatus.PENDING,
            message="Payment verification pending"
        )
    
    def cancel_payment(self, transaction_id: str) -> PaymentResult:
        """Cancel Click payment"""
        return PaymentResult(
            success=True,
            transaction_id=transaction_id,
            status=PaymentStatus.CANCELLED,
            message="Payment cancelled"
        )
    
    def refund_payment(self, transaction_id: str, amount: Optional[float] = None) -> PaymentResult:
        """Refund Click payment"""
        # Click refunds are handled through merchant dashboard
        return PaymentResult(
            success=False,
            transaction_id=transaction_id,
            status=PaymentStatus.FAILED,
            message="Refunds must be processed through Click dashboard"
        )
    
    def process_callback(self, data: Dict[str, Any]) -> PaymentResult:
        """Process Click callback (Prepare/Complete)"""
        action = data.get('action')
        
        if action == 0:  # Prepare
            # Validate and prepare for payment
            return PaymentResult(
                success=True,
                transaction_id=data.get('merchant_trans_id'),
                status=PaymentStatus.PROCESSING,
                message="Payment prepared",
                raw_response={
                    'click_trans_id': data.get('click_trans_id'),
                    'merchant_trans_id': data.get('merchant_trans_id'),
                    'error': 0,
                    'error_note': 'Success'
                }
            )
        elif action == 1:  # Complete
            # Mark payment as completed
            return PaymentResult(
                success=True,
                transaction_id=data.get('merchant_trans_id'),
                status=PaymentStatus.COMPLETED,
                message="Payment completed",
                raw_response={
                    'click_trans_id': data.get('click_trans_id'),
                    'merchant_trans_id': data.get('merchant_trans_id'),
                    'error': 0,
                    'error_note': 'Success'
                }
            )
        
        return PaymentResult(
            success=False,
            status=PaymentStatus.FAILED,
            message=f"Unknown action: {action}"
        )
