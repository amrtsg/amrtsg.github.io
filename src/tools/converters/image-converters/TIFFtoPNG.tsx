import * as UTIF from "utif";

export async function convertTIFFtoPNG(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();

  const images = UTIF.decode(buffer);

  if (!images.length) {
    throw new Error("No image data was found in the TIFF file.");
  }

  const firstImage = images[0];

  UTIF.decodeImage(buffer, firstImage);

  const rgba = UTIF.toRGBA8(firstImage);

  const width = firstImage.width;
  const height = firstImage.height;

  if (!width || !height) {
    throw new Error("Unable to determine the TIFF dimensions.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to create a canvas context.");
  }

  const imageData = new ImageData(new Uint8ClampedArray(rgba), width, height);

  context.putImageData(imageData, 0, 0);

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
