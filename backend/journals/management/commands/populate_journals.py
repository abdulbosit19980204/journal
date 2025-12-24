from django.core.management.base import BaseCommand
from journals.models import Journal
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Populates DB with dummy journals'

    def handle(self, *args, **options):
        journals = [
            {
                "name": "Uzbek Medical Journal",
                "desc": "Leading medical research journal in Uzbekistan.",
                "is_paid": True,
                "price": 50000
            },
            {
                "name": "Central Asian Tech Review",
                "desc": "Innovations in technology and engineering.",
                "is_paid": False,
                "price": 0
            },
            {
                "name": "Journal of Social Sciences",
                "desc": "Humanities, sociology, and economics.",
                "is_paid": True,
                "price": 25000
            }
        ]

        for j in journals:
            Journal.objects.get_or_create(
                slug=slugify(j["name"]),
                defaults={
                    "name_en": j["name"],
                    "description_en": j["desc"],
                    "is_paid": j["is_paid"],
                    "price_per_page": j["price"]
                }
            )
        self.stdout.write(self.style.SUCCESS('Successfully populated journals'))
