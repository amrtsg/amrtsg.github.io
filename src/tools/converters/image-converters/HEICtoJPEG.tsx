import heic2any from "heic2any";

export async function convertHEICtoJPEG(file: File): Promise<Blob> {
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });

  if (Array.isArray(converted)) {
    const firstResult = converted[0];

    if (!(firstResult instanceof Blob)) {
      throw new Error("HEIC conversion did not produce a valid image.");
    }

    return firstResult;
  }

  if (!(converted instanceof Blob)) {
    throw new Error("HEIC conversion did not produce a valid image.");
  }

  return converted;
}
