export async function convertPNGtoJPEG(file: File): Promise<Blob> {
  return convertImageToJPEG(file);
}

function convertImageToJPEG(file: File): Promise<Blob> {
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

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Unable to create the JPEG image."));
            return;
          }

          resolve(blob);
        },
        "image/jpeg",
        0.92
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The PNG file could not be read."));
    };

    image.src = url;
  });
}
