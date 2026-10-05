export async function convertSVGtoPNG(file: File): Promise<Blob> {
  const svgText = await file.text();

  const svgDocument = new DOMParser().parseFromString(svgText, "image/svg+xml");

  const svgElement = svgDocument.documentElement;

  if (svgElement.tagName.toLowerCase() !== "svg") {
    throw new Error("The file does not contain a valid SVG.");
  }

  const viewBox = svgElement.getAttribute("viewBox");
  const widthAttribute = svgElement.getAttribute("width");
  const heightAttribute = svgElement.getAttribute("height");

  let width = 1024;
  let height = 1024;

  if (viewBox) {
    const values = viewBox
      .trim()
      .split(/[\s,]+/)
      .map(Number);

    if (values.length === 4 && values.every(Number.isFinite)) {
      width = Math.max(1, Math.round(values[2]));
      height = Math.max(1, Math.round(values[3]));
    }
  }

  if (widthAttribute && heightAttribute) {
    const parsedWidth = parseFloat(widthAttribute);
    const parsedHeight = parseFloat(heightAttribute);

    if (Number.isFinite(parsedWidth) && parsedWidth > 0) {
      width = Math.round(parsedWidth);
    }

    if (Number.isFinite(parsedHeight) && parsedHeight > 0) {
      height = Math.round(parsedHeight);
    }
  }

  svgElement.setAttribute("width", `${width}`);
  svgElement.setAttribute("height", `${height}`);

  const blob = new Blob([new XMLSerializer().serializeToString(svgElement)], {
    type: "image/svg+xml",
  });

  const url = URL.createObjectURL(blob);

  try {
    const image = await loadImage(url);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create a canvas context.");
    }

    context.drawImage(image, 0, 0, width, height);

    return await canvasToPNG(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to read the SVG image."));
    image.src = url;
  });
}

function canvasToPNG(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to create the PNG image."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}
