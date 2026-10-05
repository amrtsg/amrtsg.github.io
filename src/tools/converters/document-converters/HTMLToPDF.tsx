import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function convertHTMLToPDF(file: File): Promise<Blob> {
  const html = await file.text();

  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.left = "-100000px";
  iframe.style.top = "0";
  iframe.style.width = "794px";
  iframe.style.height = "1px";
  iframe.style.border = "0";

  document.body.appendChild(iframe);

  try {
    const documentRef = iframe.contentDocument;

    if (!documentRef) {
      throw new Error("Unable to create HTML document.");
    }

    documentRef.open();
    documentRef.write(html);
    documentRef.close();

    await new Promise<void>((resolve) => {
      if (documentRef.readyState === "complete") {
        resolve();
        return;
      }

      iframe.onload = () => resolve();
    });

    const body = documentRef.body;

    if (!body) {
      throw new Error("HTML document has no body.");
    }

    const canvas = await html2canvas(body, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      windowWidth: body.scrollWidth,
      windowHeight: body.scrollHeight,
    });

    const pdf = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageWidth = pageWidth;
    const imageHeight =
      (canvas.height * imageWidth) / canvas.width;

    const image = canvas.toDataURL("image/jpeg", 0.95);

    let offset = 0;

    while (offset < imageHeight) {
      if (offset > 0) {
        pdf.addPage();
      }

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
    iframe.remove();
  }
}
