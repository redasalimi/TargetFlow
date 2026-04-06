"""
Service d'export : génère des rapports PDF et CSV
pour les segments clients d'un utilisateur.
"""
import csv
import io
from datetime import datetime
from django.db.models import Count, Avg


def export_csv(user):
    """Retourne un buffer CSV avec tous les segments de l'utilisateur."""
    from ..models import CustomerSegment, Analysis
    latest = Analysis.objects.filter(user=user, type='expert').order_by('-created_at').first()
    if not latest: return b""
    qs = CustomerSegment.objects.filter(analysis=latest).order_by('segment_name', 'customer_id')

    buffer = io.StringIO()
    writer = csv.writer(buffer)

    # En-tête
    writer.writerow([
        'Customer ID',
        'Récence (jours)',
        'Fréquence (achats)',
        'Montant total (MAD)',
        'Cluster',
        'Segment',
        'Date analyse',
    ])

    for seg in qs:
        writer.writerow([
            seg.customer_id,
            round(seg.recency, 1),
            round(seg.frequency, 1),
            round(seg.monetary, 2),
            seg.segment,
            seg.segment_name,
            seg.created_at.strftime('%Y-%m-%d %H:%M'),
        ])

    buffer.seek(0)
    return buffer.getvalue().encode('utf-8-sig')  # utf-8-sig pour Excel


def export_pdf(user):
    """Retourne un buffer PDF avec le rapport de segmentation complet."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table,
            TableStyle, HRFlowable
        )
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
    except ImportError:
        raise ImportError("reportlab non installé. Lancez : pipenv install reportlab")

    from ..models import CustomerSegment, Analysis
    latest = Analysis.objects.filter(user=user, type='expert').order_by('-created_at').first()
    if not latest: return b""
    qs = CustomerSegment.objects.filter(analysis=latest).order_by('segment_name')

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
    )

    # ── Couleurs ──────────────────────────────────────────────────────────────
    DARK       = colors.HexColor('#060A14')
    SURFACE    = colors.HexColor('#0D1424')
    ACCENT     = colors.HexColor('#00E5C4')
    ACCENT2    = colors.HexColor('#3B82F6')
    TEXT       = colors.HexColor('#E8F0FE')
    TEXT_MUTED = colors.HexColor('#6B7FA3')
    DANGER     = colors.HexColor('#EF4444')
    WARNING    = colors.HexColor('#F59E0B')

    SEG_COLORS = {
        'VIP Clients':   ACCENT,
        'Loyal Clients': ACCENT2,
        'At Risk':       DANGER,
        'New Clients':   WARNING,
    }

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'Title', parent=styles['Normal'],
        fontSize=24, fontName='Helvetica-Bold',
        textColor=ACCENT, alignment=TA_CENTER, spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        'Subtitle', parent=styles['Normal'],
        fontSize=11, fontName='Helvetica',
        textColor=TEXT_MUTED, alignment=TA_CENTER, spaceAfter=4,
    )
    section_style = ParagraphStyle(
        'Section', parent=styles['Normal'],
        fontSize=14, fontName='Helvetica-Bold',
        textColor=TEXT, spaceBefore=16, spaceAfter=8,
    )
    normal_style = ParagraphStyle(
        'Normal2', parent=styles['Normal'],
        fontSize=10, fontName='Helvetica',
        textColor=TEXT_MUTED,
    )
    bold_style = ParagraphStyle(
        'Bold', parent=styles['Normal'],
        fontSize=10, fontName='Helvetica-Bold',
        textColor=TEXT,
    )

    story = []

    # ── En-tête ───────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("TargetFlow | Marketing Intelligence", title_style))
    story.append(Paragraph(
        f"Rapport Stratégique de Segmentation · {datetime.now().strftime('%d/%m/%Y')}", 
        subtitle_style
    ))
    story.append(Paragraph(f"Utilisateur : {user.username} · Plan : {getattr(user, 'profile', None).plan.upper()}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT, spaceAfter=20))

    total = qs.count()
    if total == 0:
        story.append(Paragraph("Aucune donnée disponible pour l'analyse.", normal_style))
        doc.build(story)
        buffer.seek(0)
        return buffer.read()

    # ── Insights IA ──────────────────────────────────────────────────────────
    from .ai_insights import generate_insights
    ai_insights = generate_insights(user)
    
    if ai_insights:
        story.append(Paragraph("💡 Insights Stratégiques (Générés par IA)", section_style))
        for insight in ai_insights:
            story.append(Paragraph(f"• {insight}", normal_style))
            story.append(Spacer(1, 0.2*cm))
        story.append(Spacer(1, 0.4*cm))

    # ── KPIs ──────────────────────────────────────────────────────────────────
    story.append(Paragraph("Vue d'ensemble", section_style))

    avg_monetary = qs.aggregate(avg=Avg('monetary'))['avg'] or 0
    segments_count = qs.values('segment_name').annotate(total=Count('id'))
    nb_segments = segments_count.count()

    kpi_data = [
        ['Indicateur', 'Valeur'],
        ['Total clients analysés', str(total)],
        ['Segments détectés', str(nb_segments)],
        ['Valeur vie client moyenne', f"{avg_monetary:.0f} MAD"],
        ['Date d\'analyse', qs.first().created_at.strftime('%d/%m/%Y')],
    ]

    kpi_table = Table(kpi_data, colWidths=[10*cm, 6*cm])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND',  (0, 0), (-1, 0),  SURFACE),
        ('TEXTCOLOR',   (0, 0), (-1, 0),  ACCENT),
        ('FONTNAME',    (0, 0), (-1, 0),  'Helvetica-Bold'),
        ('FONTSIZE',    (0, 0), (-1, 0),  10),
        ('BACKGROUND',  (0, 1), (-1, -1), DARK),
        ('TEXTCOLOR',   (0, 1), (-1, -1), TEXT),
        ('FONTNAME',    (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE',    (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK, SURFACE]),
        ('GRID',        (0, 0), (-1, -1), 0.5, TEXT_MUTED),
        ('PADDING',     (0, 0), (-1, -1), 8),
        ('ALIGN',       (1, 0), (1, -1),  'RIGHT'),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 0.4*cm))

    # ── Répartition par segment ───────────────────────────────────────────────
    story.append(Paragraph("Répartition par segment", section_style))

    seg_data = [['Segment', 'Clients', 'Part %', 'Montant moyen (MAD)']]
    for seg in segments_count.annotate(avg_m=Avg('monetary')).order_by('-total'):
        pct = round((seg['total'] / total) * 100, 1)
        seg_data.append([
            seg['segment_name'],
            str(seg['total']),
            f"{pct}%",
            f"{seg['avg_m']:.0f}" if seg['avg_m'] else 'N/A',
        ])

    seg_table = Table(seg_data, colWidths=[6*cm, 3*cm, 3*cm, 5*cm])
    seg_style = [
        ('BACKGROUND',  (0, 0), (-1, 0),  SURFACE),
        ('TEXTCOLOR',   (0, 0), (-1, 0),  ACCENT),
        ('FONTNAME',    (0, 0), (-1, 0),  'Helvetica-Bold'),
        ('FONTSIZE',    (0, 0), (-1, 0),  10),
        ('BACKGROUND',  (0, 1), (-1, -1), DARK),
        ('TEXTCOLOR',   (0, 1), (-1, -1), TEXT),
        ('FONTNAME',    (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE',    (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [DARK, SURFACE]),
        ('GRID',        (0, 0), (-1, -1), 0.5, TEXT_MUTED),
        ('PADDING',     (0, 0), (-1, -1), 8),
        ('ALIGN',       (1, 0), (-1, -1), 'CENTER'),
    ]
    # Colorier la colonne segment
    for i, seg in enumerate(segments_count.order_by('-total'), 1):
        color = SEG_COLORS.get(seg['segment_name'], TEXT_MUTED)
        seg_style.append(('TEXTCOLOR', (0, i), (0, i), color))
        seg_style.append(('FONTNAME',  (0, i), (0, i), 'Helvetica-Bold'))

    seg_table.setStyle(TableStyle(seg_style))
    story.append(seg_table)
    story.append(Spacer(1, 0.4*cm))

    # Get dynamic personas from latest expert analysis if available
    latest_analysis = Analysis.objects.filter(user=user, type='expert').order_by('-created_at').first()
    dynamic_personas = []
    if latest_analysis and latest_analysis.result_data:
        dynamic_personas = latest_analysis.result_data.get('personas', [])

    if dynamic_personas:
        for p in dynamic_personas:
            story.append(Paragraph(f"• {p.get('name', 'N/A')} ({p.get('segment', 'S-1')}) : {p.get('age')} ans, {p.get('city')}", bold_style))
            story.append(Paragraph(p.get('bio', ''), normal_style))
            story.append(Spacer(1, 0.2*cm))
    else:
        # Fallback defined but less priority
        PERSONAS = {
            'VIP Clients': {
                'role': 'L\'Ambassadeur Elite', 
                'bio': 'Clients à haute valeur vie, fidèles et influents. Privilégient la qualité et l\'exclusivité.'
            },
            'Loyal Clients': {
                'role': 'Le Pilier de Croissance',
                'bio': 'Achètent régulièrement, sensibles aux programmes de fidélité et aux nouveautés.'
            },
            'At Risk': {
                'role': 'Le Client Volatil',
                'bio': 'Anciens clients réguliers en perte de vitesse. Nécessitent une attention immédiate.'
            },
            'New Clients': {
                'role': 'L\'Explorateur Potentiel',
                'bio': 'Vient de découvrir la marque. Première impression cruciale pour la rétention.'
            }
        }

        for seg_name, p_info in PERSONAS.items():
            if qs.filter(segment_name=seg_name).exists():
                story.append(Paragraph(f"• {seg_name} : {p_info['role']}", bold_style))
                story.append(Paragraph(p_info['bio'], normal_style))
                story.append(Spacer(1, 0.2*cm))

    story.append(Spacer(1, 0.5*cm))

    # ── Données détaillées (30 premiers) ─────────────────────────────────────
    story.append(Paragraph("📊 Données clients détaillées (30 premiers)", section_style))

    detail_data = [['ID', 'Ville', 'Récence', 'Fréq', 'Montant (MAD)', 'Segment']]
    for seg in qs[:30]:
        detail_data.append([
            str(seg.customer_id),
            seg.city[:12] if seg.city else 'Maroc',
            f"{seg.recency:.0f}j",
            f"{seg.frequency:.0f}",
            f"{seg.monetary:.0f}",
            seg.segment_name,
        ])

    detail_table = Table(detail_data, colWidths=[2.5*cm, 3*cm, 2*cm, 1.5*cm, 3.5*cm, 4.5*cm])
    detail_style = [
        ('BACKGROUND',    (0, 0), (-1, 0),  SURFACE),
        ('TEXTCOLOR',     (0, 0), (-1, 0),  ACCENT),
        ('FONTNAME',      (0, 0), (-1, 0),  'Helvetica-Bold'),
        ('FONTSIZE',      (0, 0), (-1, 0),  8),
        ('BACKGROUND',    (0, 1), (-1, -1), DARK),
        ('TEXTCOLOR',     (0, 1), (-1, -1), TEXT),
        ('FONTNAME',      (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE',      (0, 1), (-1, -1), 7),
        ('ROWBACKGROUNDS',(0, 1), (-1, -1), [DARK, SURFACE]),
        ('GRID',          (0, 0), (-1, -1), 0.3, TEXT_MUTED),
        ('PADDING',       (0, 0), (-1, -1), 4),
        ('ALIGN',         (1, 0), (-1, -1), 'CENTER'),
    ]
    for i, seg in enumerate(qs[:30], 1):
        color = SEG_COLORS.get(seg.segment_name, TEXT_MUTED)
        detail_style.append(('TEXTCOLOR', (5, i), (5, i), color))

    detail_table.setStyle(TableStyle(detail_style))
    story.append(detail_table)

    # ── Pied de page ──────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.6*cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=TEXT_MUTED))
    story.append(Paragraph(
        "TargetFlow — Plateforme d'intelligence marketing · Rapport confidentiel",
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8,
                       textColor=TEXT_MUTED, alignment=TA_CENTER, spaceBefore=6)
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
