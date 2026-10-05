import { jsPDF } from "jspdf";

function rtfToPlainText(rtf: string): string {
  let output = "";
  let i = 0;
  let skipDestination = false;

  while (i < rtf.length) {
    const char = rtf[i];

    if (char === "{") {
      i++;
      continue;
    }

    if (char === "}") {
      skipDestination = false;
      i++;
      continue;
    }

    if (char !== "\\") {
      if (!skipDestination) output += char;
      i++;
      continue;
    }

    i++;

    if (i >= rtf.length) break;

    if (rtf[i] === "\\" || rtf[i] === "{" || rtf[i] === "}") {
      if (!skipDestination) output += rtf[i];
      i++;
      continue;
    }

    if (rtf[i] === "~") {
      if (!skipDestination) output += " ";
      i++;
      continue;
    }

    if (rtf[i] === "-") {
      if (!skipDestination) output += "-";
      i++;
      continue;
    }

    const match = rtf.slice(i).match(/^([a-zA-Z]+)(-?\d+)? ?/);

    if (!match) {
      i++;
      continue;
    }

    const word = match[1].toLowerCase();
    const numeric = match[2];

    i += match[0].length;

    if (
      ["fonttbl", "colortbl", "stylesheet", "info", "pict", "object"]
        .includes(word)
    ) {
      skipDestination = true;
      continue;
    }

    if (word === "par" || word === "line") {
      if (!skipDestination) output += "\n";
      continue;
    }

    if (word === "tab") {
      if (!skipDestination) output += "\t";
      continue;
    }

    if (word === "u" && numeric) {
      const code = Number(numeric);

      if (!skipDestination) {
        output += String.fromCharCode(code < 0 ? code + 65536 : code);
      }

      continue;
    }

    if (word === "emdash") {
      if (!skipDestination) output += "—";
      continue;
    }

    if (word === "endash") {
      if (!skipDestination) output += "–";
    }
  }

  return output
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export async function convertRTFToPDF(file: File): Promise<Blob> {
  const rtf = await file.text();
  const text = rtfToPlainText(rtf);

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  const paragraphs = text.split("\n");
  let y = margin;

  for (const paragraph of paragraphs) {
    const lines = pdf.splitTextToSize(
      paragraph || " ",
      usableWidth,
    );

    for (const line of lines) {
      if (y > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }

      pdf.text(line, margin, y);
      y += 15;
    }

    y += 5;
  }

  return pdf.output("blob");
}
