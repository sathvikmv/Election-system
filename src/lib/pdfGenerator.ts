import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateGuidanceReport(elementId: string, filename: string = 'Election_Guidance_Report.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Generate a high-quality canvas from the DOM element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff' // Ensure white background
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Add header
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Election Navigator AI', 10, 15);
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Official Guidance & Trust Report', 10, 22);
    pdf.line(10, 25, pdfWidth - 10, 25); // Horizontal line

    // Add captured image
    pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);

    // Add footer
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(10);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 10, pageHeight - 10);
    pdf.text('election-navigator.ai', pdfWidth - 45, pageHeight - 10);

    // Save
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}
