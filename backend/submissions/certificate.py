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

# Register Fonts
FONT_PATH = r"C:\Windows\Fonts\arial.ttf"
try:
    pdfmetrics.registerFont(TTFont('Arial', FONT_PATH))
    # Fake Bold by reusing same font or strictly it should beArialbd.ttf
    # For now we stick to Arial as base.
    FONT_NAME = 'Arial'
except:
    FONT_NAME = 'Helvetica'

def generate_certificate_pdf(article, lang='en'):
    """
    Generates a PDF certificate for the given article using a Premium Design.
    Returns a BytesIO buffer.
    """
    buffer = io.BytesIO()
    
    # Setup Canvas (Landscape A4)
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)
    
    # --- TRANSLATIONS ---
    texts = {
        'en': {
            'header': "CERTIFICATE OF PUBLICATION",
            'awarded_to': "This certificate is awarded to",
            'for_publishing': "for successfully publishing the article titled",
            'in_journal': "in the",
            'date': "Date of Publication",
            'signed': "Chief Editor",
            'verify': "Scan to verify",
            'id': "Certificate ID"
        },
        'uz': {
            'header': "NASHR QILINGANLIK HAQIDA SERTIFIKAT",
            'awarded_to': "Ushbu sertifikat taqdim etiladi:",
            'for_publishing': "quyidagi mavzudagi maqolani muvaffaqiyatli nashr etgani uchun:",
            'in_journal': "Jurnal:",
            'date': "Nashr sanasi",
            'signed': "Bosh Muharrir",
            'verify': "Tekshirish uchun",
            'id': "Sertifikat ID"
        },
        'ru': {
            'header': "СЕРТИФИКАТ О ПУБЛИКАЦИИ",
            'awarded_to': "Настоящий сертификат вручается",
            'for_publishing': "за успешную публикацию статьи на тему:",
            'in_journal': "в журнале:",
            'date': "Дата публикации",
            'signed': "Главный редактор",
            'verify': "Сканируйте для проверки",
            'id': "ID Сертификата"
        }
    }
    
    t = texts.get(lang, texts['en'])
    
    # --- DESIGN IMPLEMENTATION ---
    
    # 0. Background
    c.setFillColor(colors.white)
    c.rect(0, 0, width, height, fill=1)
    
    # 1. Ornamental Border
    # Outer Gold Line
    gold_color = colors.Color(0.83, 0.68, 0.21) # #D4AF37ish
    blue_color = colors.Color(0.1, 0.2, 0.4)    # #1a365d
    
    c.setStrokeColor(gold_color)
    c.setLineWidth(5)
    c.rect(10*mm, 10*mm, width-20*mm, height-20*mm)
    
    # Inner Blue Line
    c.setStrokeColor(blue_color)
    c.setLineWidth(1.5)
    c.rect(13*mm, 13*mm, width-26*mm, height-26*mm)
    
    # Corner Accents (L-shapes)
    c.setStrokeColor(gold_color)
    c.setLineWidth(3)
    corner_len = 20*mm
    
    # Top Left
    c.line(13*mm, 13*mm+corner_len, 13*mm, 13*mm)
    c.line(13*mm, 13*mm, 13*mm+corner_len, 13*mm)
    # Top Right
    c.line(width-13*mm, 13*mm+corner_len, width-13*mm, 13*mm)
    c.line(width-13*mm, 13*mm, width-13*mm-corner_len, 13*mm)
    # Bottom Left
    c.line(13*mm, height-13*mm-corner_len, 13*mm, height-13*mm)
    c.line(13*mm, height-13*mm, 13*mm+corner_len, height-13*mm)
    # Bottom Right
    c.line(width-13*mm, height-13*mm-corner_len, width-13*mm, height-13*mm)
    c.line(width-13*mm, height-13*mm, width-13*mm-corner_len, height-13*mm)

    # 2. Header
    c.setFont(FONT_NAME, 32)
    c.setFillColor(blue_color)
    c.drawCentredString(width / 2, height - 50*mm, t['header'])
    
    # Certificate ID
    c.setFont(FONT_NAME, 10)
    c.setFillColor(colors.gray)
    cert_id = f"CAJ-{article.id}-{article.created_at.strftime('%Y')}"
    c.drawCentredString(width / 2, height - 60*mm, f"{t['id']}: {cert_id}")
    
    # 3. Awarded To
    c.setFont(FONT_NAME, 14)
    c.setFillColor(colors.gray)
    c.drawCentredString(width / 2, height - 80*mm, t['awarded_to'])
    
    # Author Name
    author_name = article.author.get_full_name() or article.author.username
    c.setFont(FONT_NAME, 26) 
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2, height - 95*mm, author_name)
    
    # Divider Line
    c.setStrokeColor(gold_color)
    c.setLineWidth(1)
    c.line(width/2 - 50*mm, height - 100*mm, width/2 + 50*mm, height - 100*mm)

    # 4. For Publishing
    c.setFont(FONT_NAME, 14)
    c.setFillColor(colors.gray)
    c.drawCentredString(width / 2, height - 110*mm, t['for_publishing'])
    
    # Article Title
    c.setFont(FONT_NAME, 18)
    c.setFillColor(colors.black)
    title = article.title
    
    # Basic word wrap logic
    words = title.split(' ')
    line1 = ""
    line2 = ""
    for w in words:
        if len(line1 + w) < 60:
            line1 += w + " "
        else:
            line2 += w + " "
            
    c.drawCentredString(width / 2, height - 122*mm, line1.strip())
    if line2:
        c.drawCentredString(width / 2, height - 130*mm, line2.strip())

    # 5. In Journal
    c.setFont(FONT_NAME, 14)
    c.setFillColor(colors.gray)
    c.drawCentredString(width / 2, height - 138*mm, t['in_journal'])
    
    # Journal Name Logic
    journal_name = getattr(article.journal, f'name_{lang}', article.journal.name_en)
    if not journal_name:
        journal_name = article.journal.name_en
        
    c.setFont(FONT_NAME, 22)
    c.setFillColor(blue_color)
    
    # Text Wrapping for Journal Name
    j_name_upper = journal_name.upper()
    if len(j_name_upper) > 40:
        c.setFont(FONT_NAME, 16) # Slightly smaller font for multi-line
        words = j_name_upper.split(' ')
        lines = []
        current_line = []
        for w in words:
            if len(" ".join(current_line + [w])) < 45: # Char limit per line
                current_line.append(w)
            else:
                lines.append(" ".join(current_line))
                current_line = [w]
        if current_line:
            lines.append(" ".join(current_line))
            
        # Draw lines centered
        start_y = height - 148*mm
        for i, line in enumerate(lines[:2]): # Limit to 2 lines as requested
            c.drawCentredString(width / 2, start_y - (i * 7*mm), line)
    else:
        c.drawCentredString(width / 2, height - 150*mm, j_name_upper)

    # 6. Footer Info - Publication Details
    footer_y = 35*mm
    
    c.setFont(FONT_NAME, 11)
    c.setFillColor(colors.black)
    
    # Left: Publication Date
    date_str = article.created_at.strftime("%d.%m.%Y")
    c.drawString(30*mm, footer_y, f"{t['date']}: {date_str}")
    
    # Center: Volume, Issue, Pages (if available)
    if article.issue:
        c.setFont(FONT_NAME, 10)
        c.setFillColor(blue_color)
        issue_text = f"Vol. {article.issue.volume}, No. {article.issue.number} ({article.issue.year})"
        if article.page_range:
            issue_text += f" • pp. {article.page_range}"
        c.drawCentredString(width / 2, footer_y, issue_text)
    
    # Right side will have QR code (moved from bottom)
    
    # 7. QR Code (Right side, larger and more prominent)
    # Robust URL Generation
    base_url = "http://localhost:3000"
    if hasattr(settings, 'CSRF_TRUSTED_ORIGINS') and len(settings.CSRF_TRUSTED_ORIGINS) > 0:
        base_url = settings.CSRF_TRUSTED_ORIGINS[0]
    elif hasattr(settings, 'ALLOWED_HOSTS') and len(settings.ALLOWED_HOSTS) > 0 and settings.ALLOWED_HOSTS[0] != '*':
        host = settings.ALLOWED_HOSTS[0]
        if 'localhost' in host or '127.0.0.1' in host:
            base_url = f"http://{host}:3000"
        else:
             base_url = f"https://{host}"
             
    qr_data = f"{base_url}/articles/{article.id}"
    qr = qrcode.make(qr_data)
    from reportlab.lib.utils import ImageReader
    qr_img = ImageReader(qr._img)
    
    qr_size = 35*mm
    qr_x = width - 65*mm # Moved further left to avoid border
    qr_y = 25*mm
    c.drawImage(qr_img, qr_x, qr_y, width=qr_size, height=qr_size)
    c.setFillColor(blue_color)
    c.setFont(FONT_NAME, 8)
    c.drawCentredString(qr_x + qr_size/2, qr_y - 5*mm, t['verify'])

    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer
