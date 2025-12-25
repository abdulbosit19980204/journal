"""
Payment Gateway Interface - Abstract Base Class for Payment Providers
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional, Dict, Any
from enum import Enum


class PaymentStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


@dataclass
class PaymentResult:
    """Result of a payment operation"""
    success: bool
    transaction_id: Optional[str] = None
    status: PaymentStatus = PaymentStatus.PENDING
    message: str = ""
    redirect_url: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = None


@dataclass
class PaymentRequest:
    """Payment request data"""
    amount: float
    currency: str = "UZS"
    order_id: str = ""
    description: str = ""
    return_url: str = ""
    cancel_url: str = ""
    customer_email: str = ""
    customer_phone: str = ""
    metadata: Optional[Dict[str, Any]] = None


class PaymentGateway(ABC):
    """Abstract base class for payment gateways"""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Gateway name"""
        pass
    
    @abstractmethod
    def create_payment(self, request: PaymentRequest) -> PaymentResult:
        """Create a new payment"""
        pass
    
    @abstractmethod
    def verify_payment(self, transaction_id: str) -> PaymentResult:
        """Verify payment status"""
        pass
    
    @abstractmethod
    def cancel_payment(self, transaction_id: str) -> PaymentResult:
        """Cancel a pending payment"""
        pass
    
    @abstractmethod
    def refund_payment(self, transaction_id: str, amount: Optional[float] = None) -> PaymentResult:
        """Refund a completed payment"""
        pass
    
    def process_callback(self, data: Dict[str, Any]) -> PaymentResult:
        """Process callback/webhook from payment provider"""
        raise NotImplementedError("Callback processing not implemented")
