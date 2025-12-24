from django.core.management.base import BaseCommand
from billing.models import SubscriptionPlan
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Populates DB with dummy plans'

    def handle(self, *args, **options):
        plans = [
            {
                "name": "Basic Researcher",
                "price": 0.00,
                "limit": 1,
                "desc": "Perfect for students. 1 free article per month."
            },
            {
                "name": "Professional Author",
                "price": 9.99,
                "limit": 5,
                "desc": "For active researchers. 5 articles per month."
            },
            {
                "name": "Institution Unlimited",
                "price": 49.99,
                "limit": 0,
                "desc": "Unlimited publishing for universities."
            }
        ]

        for p in plans:
            SubscriptionPlan.objects.get_or_create(
                slug=slugify(p["name"]),
                defaults={
                    "name": p["name"],
                    "price": p["price"],
                    "article_limit": p["limit"],
                    "description": p["desc"]
                }
            )
        self.stdout.write(self.style.SUCCESS('Successfully populated plans'))
