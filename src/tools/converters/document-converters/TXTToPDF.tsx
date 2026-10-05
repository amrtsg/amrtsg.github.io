import { jsPDF } from "jspdf";

export async function convertTXTToPDF(file: File): Promise<Blob> {
  const text = await file.text();

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;
  const lineHeight = 15;

  const lines = pdf.splitTextToSize(text || " ", usableWidth);

  pdf.setFont("courier", "normal");
  pdf.setFontSize(10);

  let y = margin;

  for (const line of lines) {
    if (y > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }

    pdf.text(line, margin, y);
    y += lineHeight;
  }

  return pdf.output("blob");
}
