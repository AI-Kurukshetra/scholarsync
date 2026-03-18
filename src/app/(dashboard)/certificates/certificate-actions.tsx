'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface Props {
  studentName: string;
  className: string;
  grade: string;
  avgMarks: number;
  certificateType: string;
  attendanceRate: number;
}

export function CertificateActions({ studentName, className, grade, avgMarks, certificateType, attendanceRate }: Props) {
  const handleDownload = () => {
    const certTitle = certificateType === 'excellence' ? 'Certificate of Excellence'
      : certificateType === 'merit' ? 'Certificate of Merit'
        : certificateType === 'attendance' ? 'Perfect Attendance Certificate'
          : 'Certificate of Participation';

    const description = certificateType === 'excellence'
      ? `for outstanding academic performance with ${avgMarks}% average marks and ${attendanceRate}% attendance`
      : certificateType === 'merit'
        ? `for meritorious academic achievement with Grade ${grade} (${avgMarks}% average)`
        : certificateType === 'attendance'
          ? `for exemplary attendance record of ${attendanceRate}% throughout the academic year`
          : `for active participation in academic activities with Grade ${grade}`;

    // Generate a printable HTML certificate
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>${certTitle} - ${studentName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f8f9fa; }
    .certificate {
      width: 900px; height: 636px; background: white; position: relative; overflow: hidden;
      border: 3px solid #1a365d; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    .certificate::before {
      content: ''; position: absolute; inset: 12px; border: 2px solid #c9a84c; pointer-events: none;
    }
    .corner { position: absolute; width: 80px; height: 80px; }
    .corner-tl { top: 20px; left: 20px; border-top: 3px solid #c9a84c; border-left: 3px solid #c9a84c; }
    .corner-tr { top: 20px; right: 20px; border-top: 3px solid #c9a84c; border-right: 3px solid #c9a84c; }
    .corner-bl { bottom: 20px; left: 20px; border-bottom: 3px solid #c9a84c; border-left: 3px solid #c9a84c; }
    .corner-br { bottom: 20px; right: 20px; border-bottom: 3px solid #c9a84c; border-right: 3px solid #c9a84c; }
    .content { text-align: center; padding: 50px 60px; position: relative; z-index: 1; }
    .school { font-family: 'Inter', sans-serif; font-size: 14px; color: #64748b; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 8px; }
    .title { font-family: 'Playfair Display', serif; font-size: 36px; color: #1a365d; margin-bottom: 6px; font-weight: 700; }
    .subtitle { font-family: 'Inter', sans-serif; font-size: 12px; color: #94a3b8; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 30px; }
    .presented { font-family: 'Inter', sans-serif; font-size: 13px; color: #64748b; margin-bottom: 8px; }
    .name { font-family: 'Playfair Display', serif; font-size: 32px; color: #c9a84c; margin-bottom: 6px; font-weight: 700; }
    .classinfo { font-family: 'Inter', sans-serif; font-size: 14px; color: #475569; margin-bottom: 16px; }
    .desc { font-family: 'Inter', sans-serif; font-size: 13px; color: #64748b; max-width: 500px; margin: 0 auto 30px; line-height: 1.6; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; padding: 0 20px; }
    .sig { text-align: center; }
    .sig-line { width: 160px; border-top: 1px solid #cbd5e1; margin-bottom: 6px; }
    .sig-text { font-family: 'Inter', sans-serif; font-size: 11px; color: #94a3b8; }
    .date { font-family: 'Inter', sans-serif; font-size: 12px; color: #94a3b8; text-align: center; }
    .seal { width: 70px; height: 70px; border-radius: 50%; border: 2px solid #c9a84c; display: flex; align-items: center; justify-content: center; font-family: 'Inter'; font-size: 9px; color: #c9a84c; text-transform: uppercase; letter-spacing: 1px; }
    @media print { body { background: white; } .certificate { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
    <div class="content">
      <div class="school">ScholarSync Academy</div>
      <div class="title">${certTitle}</div>
      <div class="subtitle">Academic Year 2025-26</div>
      <div class="presented">This certificate is proudly presented to</div>
      <div class="name">${studentName}</div>
      <div class="classinfo">${className}</div>
      <div class="desc">${description}</div>
      <div class="footer">
        <div class="sig">
          <div class="sig-line"></div>
          <div class="sig-text">Principal</div>
        </div>
        <div class="date">
          <div class="seal">Official Seal</div>
        </div>
        <div class="sig">
          <div class="sig-line"></div>
          <div class="sig-text">Class Teacher</div>
        </div>
      </div>
    </div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  return (
    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleDownload}>
      <Download className="mr-1 h-3 w-3" />
      Generate
    </Button>
  );
}
