export async function convertWEBPtoPNG(file: File): Promise<Blob> {
  return convertImageToPNG(file);
}

function convertImageToPNG(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Unable to create a canvas context."));
        return;
      }

      context.drawImage(image, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Unable to create the PNG image."));
          return;
        }

        resolve(blob);
      }, "image/png");
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The WebP file could not be read."));
    };

    image.src = url;
  });
}
