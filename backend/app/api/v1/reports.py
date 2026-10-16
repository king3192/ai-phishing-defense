import io
import csv
import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_current_user_flexible
from app.models.user import User
from app.models.scan import Scan
from app.models.report import Report

router = APIRouter(prefix="/reports", tags=["Reports"])

def filter_scans_query(query, scan_id: Optional[int], start_date: Optional[str], end_date: Optional[str]):
    if scan_id:
        query = query.filter(Scan.id == scan_id)
    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(Scan.created_at >= start_dt)
        except ValueError:
            pass
    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
            query = query.filter(Scan.created_at <= end_dt)
        except ValueError:
            pass
    return query

@router.get("/export/csv")
def export_csv(
    scan_id: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user_flexible),
    db: Session = Depends(get_db)
):
    query = db.query(Scan).filter(Scan.user_id == current_user.id)
    query = filter_scans_query(query, scan_id, start_date, end_date)
    scans = query.order_by(Scan.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Scan ID", "Vector Type", "Payload Content", "Verdict", 
        "Threat Score (0-100)", "Scam Category", "Signals Detected", "Timestamp"
    ])

    for s in scans:
        try:
            signals = ", ".join(json.loads(s.explainability_json))
        except Exception:
            signals = ""
        writer.writerow([
            s.id, 
            s.scan_type.upper(), 
            s.input_content, 
            s.verdict, 
            s.threat_score, 
            s.scam_type, 
            signals, 
            s.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])

    # Record report generation
    rep = Report(
        user_id=current_user.id, 
        report_type="scan_history" if not scan_id else "single_scan", 
        file_format="csv"
    )
    db.add(rep)
    db.commit()

    output.seek(0)
    filename = f"phishguard_threat_report_{scan_id or 'audit'}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/pdf")
def export_pdf(
    scan_id: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user_flexible),
    db: Session = Depends(get_db)
):
    query = db.query(Scan).filter(Scan.user_id == current_user.id)
    query = filter_scans_query(query, scan_id, start_date, end_date)
    scans = query.order_by(Scan.created_at.desc()).all()

    # Build PDF using ReportLab
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=36,
            rightMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=colors.HexColor('#0f172a')
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#64748b')
        )
        meta_label_style = ParagraphStyle(
            'MetaLabel',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#334155')
        )
        meta_value_style = ParagraphStyle(
            'MetaVal',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#0f172a')
        )
        table_header_style = ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=colors.white
        )
        table_cell_style = ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=7.5,
            leading=9.5,
            textColor=colors.HexColor('#1e293b')
        )
        table_cell_bold = ParagraphStyle(
            'TableCellBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=7.5,
            leading=9.5,
            textColor=colors.HexColor('#0f172a')
        )

        elements = []

        # 1. Official Header & Branding
        elements.append(Paragraph("🛡️ PHISHGUARD AI DEFENSE PLATFORM", title_style))
        elements.append(Paragraph("Automated Cybersecurity Threat Intelligence & Forensic Audit Report", subtitle_style))
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#06b6d4'), spaceBefore=2, spaceAfter=12))

        # 2. Metadata Box
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        meta_data = [
            [
                Paragraph("<b>Audit Requester:</b>", meta_label_style),
                Paragraph(f"{current_user.name} ({current_user.email})", meta_value_style),
                Paragraph("<b>Report Generated:</b>", meta_label_style),
                Paragraph(now_str, meta_value_style)
            ],
            [
                Paragraph("<b>Security Score:</b>", meta_label_style),
                Paragraph(f"{current_user.security_score}/100", meta_value_style),
                Paragraph("<b>Total Scans Audited:</b>", meta_label_style),
                Paragraph(f"{len(scans)} records", meta_value_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[110, 160, 120, 150])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 16))

        # 3. Table of Scans
        if not scans:
            elements.append(Paragraph("<i>No scan records found matching the specified parameters.</i>", subtitle_style))
        else:
            table_rows = [[
                Paragraph("ID", table_header_style),
                Paragraph("Type", table_header_style),
                Paragraph("Payload / Target", table_header_style),
                Paragraph("Verdict", table_header_style),
                Paragraph("Risk Score", table_header_style),
                Paragraph("Scam Type", table_header_style),
                Paragraph("Timestamp", table_header_style),
            ]]

            for s in scans:
                # Color code verdict
                if s.verdict == "Phishing":
                    v_color = colors.HexColor('#e11d48')
                elif s.verdict == "Suspicious":
                    v_color = colors.HexColor('#d97706')
                else:
                    v_color = colors.HexColor('#059669')

                v_cell = Paragraph(f"<font color='{v_color.hexval()}'><b>{s.verdict}</b></font>", table_cell_style)
                
                # Truncate content for PDF table cleanly
                content_display = s.input_content[:55] + "..." if len(s.input_content) > 55 else s.input_content

                table_rows.append([
                    Paragraph(f"#{s.id}", table_cell_bold),
                    Paragraph(s.scan_type.upper(), table_cell_style),
                    Paragraph(content_display, table_cell_style),
                    v_cell,
                    Paragraph(f"<b>{s.threat_score}</b>/100", table_cell_style),
                    Paragraph(s.scam_type or "None", table_cell_style),
                    Paragraph(s.created_at.strftime("%Y-%m-%d %H:%M"), table_cell_style),
                ])

            scans_table = Table(table_rows, colWidths=[30, 45, 185, 65, 55, 85, 75])
            scans_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('LEFTPADDING', (0, 0), (-1, -1), 5),
                ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ]))
            elements.append(scans_table)

        # 4. Footer Disclaimer
        elements.append(Spacer(1, 20))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceBefore=4, spaceAfter=8))
        elements.append(Paragraph(
            "Confidentiality Notice: This report contains security analytics generated by PhishGuard AI. "
            "It is intended solely for the authorized account holder. Do not distribute without authorization.",
            subtitle_style
        ))

        doc.build(elements)
        buffer.seek(0)

        # Record report generation
        rep = Report(
            user_id=current_user.id, 
            report_type="scan_history" if not scan_id else "single_scan", 
            file_format="pdf"
        )
        db.add(rep)
        db.commit()

        filename = f"phishguard_threat_report_{scan_id or 'audit'}.pdf"
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"PDF generation failed: {str(e)}"
        )

@router.get("/export/pdf-data")
def export_pdf_data(
    scan_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Scan).filter(Scan.user_id == current_user.id)
    if scan_id:
        query = query.filter(Scan.id == scan_id)

    scans = query.order_by(Scan.created_at.desc()).all()

    scans_data = []
    for s in scans:
        try:
            signals = json.loads(s.explainability_json)
        except Exception:
            signals = []
        scans_data.append({
            "id": s.id,
            "scan_type": s.scan_type.upper(),
            "content": s.input_content,
            "verdict": s.verdict,
            "threat_score": s.threat_score,
            "scam_type": s.scam_type,
            "signals": signals,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M:%S")
        })

    # Log report generation
    rep = Report(user_id=current_user.id, report_type="scan_history" if not scan_id else "single_scan", file_format="pdf")
    db.add(rep)
    db.commit()

    return {
        "title": "AI Phishing Defense Platform — Security Threat Audit Report",
        "generated_by": current_user.name,
        "email": current_user.email,
        "generated_at": scans_data[0]["created_at"] if scans_data else datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        "scans": scans_data
    }
