import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportOptions {
  title: string;
  filename: string;
  orientation?: 'portrait' | 'landscape';
}

export async function exportToPdf(
  element: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const { title, filename, orientation = 'portrait' } = options;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const headerHeight = 25;
  const footerHeight = 10;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - headerHeight - footerHeight - margin;

  // Calculate image dimensions
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Add header
  pdf.setFontSize(16);
  pdf.setTextColor(33, 33, 33);
  pdf.text(title, margin, margin + 5);
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `Gerado em: ${new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`,
    margin,
    margin + 12
  );

  // Draw header line
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, headerHeight, pageWidth - margin, headerHeight);

  // Handle multiple pages if content is too tall
  const totalPages = Math.ceil(imgHeight / contentHeight);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      pdf.addPage();
      // Add header on subsequent pages
      pdf.setFontSize(16);
      pdf.setTextColor(33, 33, 33);
      pdf.text(title, margin, margin + 5);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`(continuação)`, margin, margin + 12);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, headerHeight, pageWidth - margin, headerHeight);
    }

    // Calculate the portion of the image to show on this page
    const sourceY = page * contentHeight * (canvas.width / contentWidth);
    const sourceHeight = Math.min(
      contentHeight * (canvas.width / contentWidth),
      canvas.height - sourceY
    );
    const destHeight = (sourceHeight * contentWidth) / canvas.width;

    // Create a temporary canvas for this page's portion
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = sourceHeight;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      tempCtx.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sourceHeight,
        0,
        0,
        canvas.width,
        sourceHeight
      );
      
      const pageImgData = tempCanvas.toDataURL('image/png');
      pdf.addImage(pageImgData, 'PNG', margin, headerHeight + 3, contentWidth, destHeight);
    }

    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Precificação Inteligente - Página ${page + 1} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  pdf.save(`${filename}.pdf`);
}
