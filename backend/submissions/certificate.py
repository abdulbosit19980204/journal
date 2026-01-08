import io
import os
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import inch, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from django.conf import settings

# Register Fonts (Windows specific path for now, robust enough for this local env)
# In production (Linux), you'd need to copy a .ttf file to the project headers.
FONT_PATH = r"C:\Windows\Fonts\arial.ttf"
try:
    pdfmetrics.registerFont(TTFont('Arial', FONT_PATH))
    FONT_NAME = 'Arial'
except:
    FONT_NAME = 'Helvetica' # Fallback, might not support Cyrillic

def generate_certificate_pdf(article, lang='en'):
    """
    Generates a PDF certificate for the given article.
    Returns a BytesIO buffer.
    """
    buffer = io.BytesIO()
    
    # Setup Canvas (Landscape A4)
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)
    
    # --- CONSTANTS & TEXTS ---
    texts = {
        'en': {
            'header': "CERTIFICATE OF PUBLICATION",
            'awarded_to': "This certificate is awarded to",
            'for_publishing': "for successfully publishing the article titled",
            'in_journal': "in the",
            'date': "Date of Publication",
            'signed': "Chief Editor",
            'verify': "Scan to verify",
        },
        'uz': {
            'header': "NASHR QILINGANLIK HAQIDA SERTIFIKAT",
            'awarded_to': "Ushbu sertifikat taqdim etiladi:",
            'for_publishing': "quyidagi mavzudagi maqolani muvaffaqiyatli nashr etgani uchun:",
            'in_journal': "Jurnal:",
            'date': "Nashr sanasi",
            'signed': "Bosh Muharrir",
            'verify': "Tekshirish uchun",
        },
        'ru': {
            'header': "СЕРТИФИКАТ О ПУБЛИКАЦИИ",
            'awarded_to': "Настоящий сертификат вручается",
            'for_publishing': "за успешную публикацию статьи на тему:",
            'in_journal': "в журнале:",
            'date': "Дата публикации",
            'signed': "Главный редактор",
            'verify': "Сканируйте для проверки",
        }
    }
    
    t = texts.get(lang, texts['en'])
    
    # --- DESIGN ---
    
    # 1. Border
    c.setStrokeColor(colors.gold)
    c.setLineWidth(5)
    c.rect(20, 20, width-40, height-40)
    
    c.setStrokeColor(colors.darkblue)
    c.setLineWidth(2)
    c.rect(25, 25, width-50, height-50)

    # 2. Header
    c.setFont(FONT_NAME, 30)
    c.setFillColor(colors.darkblue)
    c.drawCentredString(width / 2, height - 80, t['header'])
    
    # 3. Logo (Optional, placeholder text for now)
    # c.drawImage(...) if we had one
    
    # 4. Awarded To
    c.setFont(FONT_NAME, 14)
    c.setFillColor(colors.gray)
    c.drawCentredString(width / 2, height - 140, t['awarded_to'])
    
    c.setFont(FONT_NAME, 24)
    c.setFillColor(colors.black)
    author_name = article.author.get_full_name() or article.author.username
    c.drawCentredString(width / 2, height - 180, author_name)
    
    c.line(width/2 - 150, height - 190, width/2 + 150, height - 190)

    # 5. Article Title
    c.setFont(FONT_NAME, 14)
    c.setFillColor(colors.gray)
    c.drawCentredString(width / 2, height - 230, t['for_publishing'])
    
    c.setFont(FONT_NAME, 18)
    c.setFillColor(colors.black)
    # Wrap text if too long (Basic implementation)
    title = article.title
    if len(title) > 60:
        c.setFont(FONT_NAME, 14)
        # Split purely by length for simplicity in this artifact
        line1 = title[:70]
        line2 = title[70:]
        c.drawCentredString(width / 2, height - 260, line1)
        c.drawCentredString(width / 2, height - 280, line2 + "...")
    else:
        c.drawCentredString(width / 2, height - 260, title)

    # 6. Journal Name
    c.setFont(FONT_NAME, 14)
    c.setFillColor(colors.gray)
    c.drawCentredString(width / 2, height - 330, t['in_journal'])
    
    c.setFont(FONT_NAME, 18)
    c.setFillColor(colors.darkblue)
    journal_name = getattr(article.journal, f'name_{lang}', article.journal.name_en)
    if not journal_name:
        journal_name = article.journal.name_en
    c.drawCentredString(width / 2, height - 360, journal_name)

    # 7. Metadata (Date & Signature)
    c.setFont(FONT_NAME, 12)
    c.setFillColor(colors.black)
    
    # Bottom Left: Date
    date_str = article.created_at.strftime("%Y-%m-%d") # Or published_at if available
    c.drawString(100, 100, f"{t['date']}: {date_str}")
    
    # Bottom Right: Signature
    c.drawString(width - 250, 100, f"{t['signed']}: _________________")

    # 8. QR Code
    # Generate QR
    # 8. QR Code
    # Generate QR
    base_url = "http://localhost:3000"
    if hasattr(settings, 'CSRF_TRUSTED_ORIGINS') and len(settings.CSRF_TRUSTED_ORIGINS) > 0:
        base_url = settings.CSRF_TRUSTED_ORIGINS[0]
    elif hasattr(settings, 'ALLOWED_HOSTS') and len(settings.ALLOWED_HOSTS) > 0 and settings.ALLOWED_HOSTS[0] != '*':
        # Use first allowed host, assume https if not local? Safe to assume http for dev
        host = settings.ALLOWED_HOSTS[0]
        if 'localhost' in host or '127.0.0.1' in host:
            base_url = f"http://{host}:3000" # Assume frontend port 3000
        else:
             base_url = f"https://{host}"
    
    qr_data = f"{base_url}/articles/{article.id}" # Link to article
    qr = qrcode.make(qr_data)
    
    # Save QR to temp file or stream? Reportlab needs file usually or ImageReader
    # Let's use internal reportlab utils to handle PIL image
    from reportlab.lib.utils import ImageReader
    qr_img = ImageReader(qr._img)
    
    c.drawImage(qr_img, width / 2 - 40, 60, width=80, height=80) 
    c.setFont(FONT_NAME, 8)
    c.drawCentredString(width / 2, 50, t['verify'])

    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer
