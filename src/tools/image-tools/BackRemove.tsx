import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  Download,
  Image as ImageIcon,
  LoaderCircle,
  LockKeyhole,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { pipeline } from "@huggingface/transformers";

import "./tools.css";

type Status = "ready" | "processing" | "done" | "error";

type Item = {
  id: string;

  file: File;

  preview: string;

  output?: Blob;

  outputUrl?: string;

  outputName?: string;

  status: Status;

  error?: string;
};

const createId = () => crypto.randomUUID();

const formatBytes = (value: number) => {
  if (value < 1024) return `${value} B`;

  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const getOutputName = (name: string) => `${name.replace(/\.[^/.]+$/, "")}-no-bg.png`;

const MODEL = "studioludens/birefnet-lite-512";

type Segmenter = (input: File | Blob | string) => Promise<any>;

let segmenterPromise: Promise<Segmenter> | undefined;

const getSegmenter = async (): Promise<Segmenter> => {
  if (!segmenterPromise) {
    segmenterPromise = (pipeline as any)("image-segmentation", MODEL, {
      device: "wasm",

      dtype: "fp32",
    }) as Promise<Segmenter>;
  }

  return segmenterPromise;
};

const maskToBlob = async (file: File, mask: any) => {
  const source = await createImageBitmap(file);

  const width = source.width;

  const height = source.height;

  const maskCanvas = document.createElement("canvas");

  maskCanvas.width = mask.width;

  maskCanvas.height = mask.height;

  const maskContext = maskCanvas.getContext("2d");

  if (!maskContext) throw new Error("Unable to create mask canvas.");

  const maskData =
    mask.data instanceof Uint8ClampedArray ? mask.data : new Uint8ClampedArray(mask.data);

  const rgba = new Uint8ClampedArray(mask.width * mask.height * 4);

  for (let i = 0; i < mask.width * mask.height; i += 1) {
    const value = maskData[i] ?? 0;

    const offset = i * 4;

    rgba[offset] = 255;

    rgba[offset + 1] = 255;

    rgba[offset + 2] = 255;

    rgba[offset + 3] = value;
  }

  maskContext.putImageData(new ImageData(rgba, mask.width, mask.height), 0, 0);

  const output = document.createElement("canvas");

  output.width = width;

  output.height = height;

  const context = output.getContext("2d");

  if (!context) throw new Error("Unable to create output canvas.");

  context.drawImage(source, 0, 0, width, height);

  source.close();

  const alphaCanvas = document.createElement("canvas");

  alphaCanvas.width = width;

  alphaCanvas.height = height;

  const alphaContext = alphaCanvas.getContext("2d");

  if (!alphaContext) throw new Error("Unable to create alpha canvas.");

  alphaContext.imageSmoothingEnabled = true;

  alphaContext.drawImage(maskCanvas, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);

  const alpha = alphaContext.getImageData(0, 0, width, height).data;

  for (let i = 0; i < imageData.data.length; i += 4) {
    const rawAlpha = alpha[i] / 255;

    // Keep the segmentation fairly firm while retaining a small antialiased edge.

    const t = Math.max(0, Math.min(1, (rawAlpha - 0.12) / 0.68));

    const cleanAlpha = t * t * (3 - 2 * t);

    imageData.data[i + 3] = Math.round(cleanAlpha * 255);
  }

  // Remove the white background spill that is still classified as foreground

  // along object boundaries. Only near-white pixels touching transparency are

  // removed, so white details inside an object are preserved. Two small passes

  // clean the visible white outline without noticeably shrinking the objects.

  const pixels = imageData.data;

  const isWhite = (index: number) => {
    const r = pixels[index];

    const g = pixels[index + 1];

    const b = pixels[index + 2];

    return r > 220 && g > 220 && b > 220 && Math.max(r, g, b) - Math.min(r, g, b) < 28;
  };

  for (let pass = 0; pass < 2; pass += 1) {
    const remove = new Uint8Array(width * height);

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const pixel = y * width + x;

        const index = pixel * 4;

        if (pixels[index + 3] === 0 || !isWhite(index)) continue;

        let touchesTransparent = false;

        for (let dy = -1; dy <= 1 && !touchesTransparent; dy += 1) {
          const ny = y + dy;

          if (ny < 0 || ny >= height) continue;

          for (let dx = -1; dx <= 1; dx += 1) {
            const nx = x + dx;

            if (nx < 0 || nx >= width) continue;

            if (pixels[(ny * width + nx) * 4 + 3] === 0) {
              touchesTransparent = true;

              break;
            }
          }
        }

        if (touchesTransparent) remove[pixel] = 1;
      }
    }

    for (let pixel = 0; pixel < remove.length; pixel += 1) {
      if (remove[pixel]) pixels[pixel * 4 + 3] = 0;
    }
  }

  context.putImageData(imageData, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    output.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Unable to create PNG."))),

      "image/png"
    );
  });
};

function BackRemove() {
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<Item[]>([]);

  const [selectedId, setSelectedId] = useState<string>();

  const [processing, setProcessing] = useState(false);

  const [applyAll, setApplyAll] = useState(true);

  const [notice, setNotice] = useState("");

  const selected = files.find((file) => file.id === selectedId);

  const completed = files.filter((file) => file.status === "done").length;

  const failed = files.filter((file) => file.status === "error").length;

  const progress = files.length ? Math.round(((completed + failed) / files.length) * 100) : 0;

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        URL.revokeObjectURL(file.preview);

        if (file.outputUrl) URL.revokeObjectURL(file.outputUrl);
      });
    };
  }, []);

  const addFiles = (list: FileList | File[]) => {
    const input = Array.from(list);

    const images = input.filter((file) => file.type.startsWith("image/"));

    if (!images.length) {
      setNotice("Please select image files.");

      return;
    }

    const items = images.map((file) => ({
      id: createId(),

      file,

      preview: URL.createObjectURL(file),

      status: "ready" as Status,
    }));

    setFiles((current) => [...current, ...items]);

    setSelectedId((current) => current ?? items[0]?.id);

    setNotice(
      images.length < input.length ? "Some files were skipped because they are not images." : ""
    );
  };

  const removeFile = (fileId: string) => {
    const item = files.find((file) => file.id === fileId);

    if (item) {
      URL.revokeObjectURL(item.preview);

      if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
    }

    setFiles((current) => current.filter((file) => file.id !== fileId));

    if (selectedId === fileId) {
      setSelectedId(files.find((file) => file.id !== fileId)?.id);
    }
  };

  const clearFiles = () => {
    files.forEach((file) => {
      URL.revokeObjectURL(file.preview);

      if (file.outputUrl) URL.revokeObjectURL(file.outputUrl);
    });

    setFiles([]);

    setSelectedId(undefined);

    setProcessing(false);

    setNotice("");
  };

  const processFile = async (item: Item) => {
    try {
      setFiles((current) =>
        current.map((file) =>
          file.id === item.id ? { ...file, status: "processing", error: undefined } : file
        )
      );

      const segmenter = await getSegmenter();

      const result = await segmenter(item.file);

      const segments = Array.isArray(result) ? result : [result];

      const best = segments

        .filter((entry: any) => entry?.mask)

        .sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))[0];

      if (!best?.mask) throw new Error("Background removal returned no mask.");

      const outputBlob = await maskToBlob(item.file, best.mask);

      const outputUrl = URL.createObjectURL(outputBlob);

      setFiles((current) =>
        current.map((file) =>
          file.id === item.id
            ? {
                ...file,

                output: outputBlob,

                outputUrl,

                outputName: getOutputName(item.file.name),

                status: "done",
              }
            : file
        )
      );
    } catch (error) {
      setFiles((current) =>
        current.map((file) =>
          file.id === item.id
            ? {
                ...file,

                status: "error",

                error: error instanceof Error ? error.message : "Background removal failed.",
              }
            : file
        )
      );
    }
  };

  const process = async () => {
    if (!files.length || processing) return;

    setProcessing(true);

    const targets = applyAll ? files : selected ? [selected] : [];

    for (const item of targets) {
      await processFile(item);
    }

    setProcessing(false);
  };

  const download = (item: Item) => {
    if (!item.output) return;

    const url = item.outputUrl ?? URL.createObjectURL(item.output);

    const link = document.createElement("a");

    link.href = url;

    link.download = item.outputName ?? getOutputName(item.file.name);

    link.click();

    if (!item.outputUrl) URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    files

      .filter((file) => file.output)

      .forEach((file, index) => {
        setTimeout(() => download(file), index * 120);
      });
  };

  return (
    <div className="background-remove-page">
      <header>
        <button className="back" type="button" onClick={() => navigate("/tools")}>
          <ArrowLeft size={14} />
          Back to Tools
        </button>

        <div className="eyebrow">Image Tools</div>

        <h1>Background Remover</h1>

        <p>Remove image backgrounds and export transparent PNGs.</p>
      </header>

      <div className="card">
        {!files.length ? (
          <label className="drop">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                if (event.target.files) addFiles(event.target.files);

                event.target.value = "";
              }}
            />

            <Upload size={28} />

            <b>Drop images here or click to upload</b>

            <span>PNG, JPEG, WEBP, and other common image formats</span>
          </label>
        ) : (
          <>
            <div className="filebar">
              <span>
                {files.length} image{files.length !== 1 ? "s" : ""}
              </span>

              <div>
                <button className="mini" type="button" onClick={() => inputRef.current?.click()}>
                  <Plus size={13} />
                  Add
                </button>

                <button className="mini" type="button" onClick={clearFiles}>
                  <Trash2 size={13} />
                  Clear
                </button>
              </div>
            </div>

            <input
              ref={inputRef}
              hidden
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                if (event.target.files) addFiles(event.target.files);

                event.target.value = "";
              }}
            />

            <div className="file-list" aria-label="Uploaded images">
              {files.map((file) => (
                <div
                  className={`file-item ${file.id === selectedId ? "active" : ""}`}
                  key={file.id}>
                  <button
                    className="file-select"
                    type="button"
                    onClick={() => setSelectedId(file.id)}
                    aria-label={`Select ${file.file.name}`}
                    aria-pressed={file.id === selectedId}>
                    <span className="file-thumb">
                      <img src={file.outputUrl ?? file.preview} alt="" />
                      <span className={`file-thumb-status ${file.status}`} />
                    </span>
                    <span className="file-item-details">
                      <span className="file-item-name">{file.file.name}</span>
                      <span className="file-item-state">
                        {file.status === "done"
                          ? "Done"
                          : file.status === "error"
                            ? "Failed"
                            : file.status === "processing"
                              ? "Processing"
                              : "Ready"}
                      </span>
                    </span>
                  </button>
                  <button
                    className="file-remove"
                    type="button"
                    onClick={() => removeFile(file.id)}
                    aria-label={`Remove ${file.file.name}`}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {selected && (
              <div className={`preview ${selected.status === "processing" ? "loading" : ""}`}>
                <img
                  src={selected.outputUrl ?? selected.preview}
                  alt={selected.output ? "Background removed preview" : "Original preview"}
                />

                {selected.status === "processing" && (
                  <div className="empty-preview">
                    <LoaderCircle size={22} />

                    <b>Removing background…</b>
                  </div>
                )}
              </div>
            )}

            <div className="settings">
              <div className="settings-head">
                <div>
                  <b>{selected?.file.name}</b>

                  <span>{selected ? formatBytes(selected.file.size) : ""}</span>
                </div>

                <label className="apply">
                  <input
                    type="checkbox"
                    checked={applyAll}
                    onChange={(event) => setApplyAll(event.target.checked)}
                  />
                  Apply to all
                </label>
              </div>

              <div className="info">
                <span>
                  Original
                  <b>{formatBytes(selected?.file.size ?? 0)}</b>
                </span>

                <span>
                  Result
                  <b>{selected?.output ? formatBytes(selected.output.size) : "—"}</b>
                </span>

                <span>
                  Format <b>PNG</b>
                </span>
              </div>

              {notice && <div className="error">{notice}</div>}

              {selected?.error && <div className="error">{selected.error}</div>}
            </div>

            <div className="actions">
              <button
                className="button"
                type="button"
                disabled={!selected?.output}
                onClick={() => selected && download(selected)}>
                <Download size={14} />
                Download
              </button>

              <button className="button" type="button" disabled={!completed} onClick={downloadAll}>
                <Download size={14} />
                Download all
              </button>

              <button
                className="button primary"
                type="button"
                disabled={processing || !files.length}
                onClick={process}>
                <ImageIcon size={14} />

                {processing ? "Processing…" : "Remove background"}
              </button>
            </div>

            {processing && (
              <div className="processing">
                <div className="processing-head">
                  <div>
                    <b>Processing locally</b>

                    <span>Background removal runs in your browser.</span>
                  </div>

                  <strong>{progress}%</strong>
                </div>

                <div className="progress">
                  <i style={{ width: `${progress}%` }} />
                </div>

                <div className="status-list">
                  {files.map((file) => (
                    <div className="status" key={file.id}>
                      <span className={`status-dot ${file.status}`} />

                      <span>{file.file.name}</span>

                      <em>
                        {file.status === "done"
                          ? "Done"
                          : file.status === "error"
                            ? "Failed"
                            : file.status === "processing"
                              ? "Processing"
                              : "Waiting"}
                      </em>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="privacy">
        <LockKeyhole size={17} />

        <div>
          <b>Processed locally</b>

          <span>Your images are processed in the browser and are not uploaded to a server.</span>
        </div>
      </div>
    </div>
  );
}

export default BackRemove;
