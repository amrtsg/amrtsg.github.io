import mammoth from "mammoth";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function convertDOCXToPDF(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-100000px";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.padding = "48px";
  container.style.boxSizing = "border-box";
  container.style.background = "#fff";
  container.style.color = "#111";
  container.style.fontFamily = "Arial, Helvetica, sans-serif";
  container.style.fontSize = "14px";
  container.style.lineHeight = "1.5";
  container.innerHTML = result.value;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageWidth = pageWidth;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;
    const image = canvas.toDataURL("image/jpeg", 0.95);

    let offset = 0;

    while (offset < imageHeight) {
      if (offset > 0) pdf.addPage();

      pdf.addImage(
        image,
        "JPEG",
        0,
        -offset,
        imageWidth,
        imageHeight,
      );

      offset += pageHeight;
    }

    return pdf.output("blob");
  } finally {
    container.remove();
  }
}
