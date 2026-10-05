import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Download, Minus, Plus, Trash2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./tools.css";

type Status = "ready" | "processing" | "done" | "error";
type Format = "jpeg" | "png" | "webp";
type Settings = { quality: string };
type ImageItem = {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
  output?: Blob;
  outputName?: string;
  status: Status;
  error?: string;
};

const id = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const defaults = (): Settings => ({ quality: "85" });
const formatType = (format: Format) => (format === "jpeg" ? "image/jpeg" : `image/${format}`);
const fileFormat = (file: File): Format =>
  file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpeg";
const outputName = (name: string) =>
  `${name.replace(/\.[^.]+$/, "")}-compressed${name.match(/\.[^.]+$/)?.[0] ?? ""}`;

async function image(file: File) {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Unable to read image."));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function compress(file: File, quality: number) {
  const format = fileFormat(file);
  const img = await image(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Unable to create image canvas.");
  ctx.drawImage(img, 0, 0);

  if (format === "png" && quality < 100) {
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const levels = Math.max(2, Math.round(2 + quality * 0.62));
    const step = 255 / (levels - 1);
    for (let i = 0; i < pixels.data.length; i += 4) {
      pixels.data[i] = Math.round(Math.round(pixels.data[i] / step) * step);
      pixels.data[i + 1] = Math.round(Math.round(pixels.data[i + 1] / step) * step);
      pixels.data[i + 2] = Math.round(Math.round(pixels.data[i + 2] / step) * step);
    }
    ctx.putImageData(pixels, 0, 0);
  }

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => {
        if (!b) return reject(new Error("Unable to compress image."));
        resolve(b.size < file.size ? b : file);
      },
      formatType(format),
      format === "png" ? undefined : quality / 100
    )
  );
}

const formatBytes = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

function Processing({ files, processing }: { files: ImageItem[]; processing: boolean }) {
  const done = files.filter((f) => f.status === "done").length;
  const failed = files.filter((f) => f.status === "error").length;
  const complete = files.length > 0 && done === files.length;
  const title = processing
    ? "Processing images"
    : complete
      ? "Processing complete"
      : failed
        ? "Finished with errors"
        : "Processing";
  const subtitle = processing
    ? `Processing ${Math.min(done + failed + 1, files.length)} of ${files.length}`
    : complete
      ? `${done} ${done === 1 ? "image" : "images"} processed successfully`
      : failed
        ? `${done} processed, ${failed} failed`
        : "Ready to process";
  return (
    <section className="processing">
      <div className="processing-head">
        <div>
          <b>{title}</b>
          <span>{subtitle}</span>
        </div>
        <strong>
          {done}/{files.length}
        </strong>
      </div>
      <div className="progress">
        <i style={{ width: `${files.length ? (done / files.length) * 100 : 0}%` }} />
      </div>
      <div className="status-list">
        {files.map((f) => (
          <div className="status" key={f.id}>
            <span className={`status-dot ${f.status}`} />
            <span>{f.file.name}</span>
            <em>
              {f.status === "error"
                ? f.error || "Failed"
                : f.status === "done"
                  ? "Done"
                  : f.status === "processing"
                    ? "Processing…"
                    : "Ready"}
            </em>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ImageCompressPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [settings, setSettings] = useState<Record<string, Settings>>({});
  const [applyAll, setApplyAll] = useState(false);
  const [allSettings, setAllSettings] = useState<Settings>(defaults());
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string>();
  const [previewSize, setPreviewSize] = useState<number>();
  const previewUrl = useRef<string | null>(null);
  const selected = files.find((f) => f.id === selectedId);
  const current = selected ? (settings[selected.id] ?? defaults()) : undefined;
  const active = applyAll ? allSettings : (current ?? defaults());
  const quality = active.quality;
  const format = selected ? fileFormat(selected.file) : "webp";
  const value = Number(quality);
  const valid = value >= 1 && value <= 100 && quality !== "";

  useEffect(
    () => () => {
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    },
    []
  );

  useEffect(() => {
    if (!selected || !valid) {
      setPreview(undefined);
      setPreviewSize(undefined);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const blob = await compress(selected.file, value);
        if (cancelled) return;
        if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
        previewUrl.current = URL.createObjectURL(blob);
        setPreview(previewUrl.current);
        setPreviewSize(blob.size);
      } catch {
        if (!cancelled) setPreview(undefined);
      }
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selected?.id, selected?.file, quality, format]);

  const update = (q: string) => {
    if (!selected) return;
    setSettings((v) => ({
      ...v,
      [selected.id]: { ...(v[selected.id] ?? defaults()), quality: q },
    }));
  };

  const changeQuality = (amount: number) => {
    const next = Math.min(100, Math.max(1, (Number(quality) || 85) + amount));
    applyAll ? setAllSettings((v) => ({ ...v, quality: String(next) })) : update(String(next));
  };

  const add = async (input: FileList | File[]) => {
    const added: ImageItem[] = [];
    for (const file of Array.from(input).filter((f) => f.type.startsWith("image/"))) {
      try {
        const img = await image(file);
        added.push({
          id: id(),
          file,
          preview: URL.createObjectURL(file),
          width: img.naturalWidth,
          height: img.naturalHeight,
          status: "ready",
        });
      } catch {}
    }
    if (!added.length) return;
    setFiles((v) => [...v, ...added]);
    setSelectedId((v) => v ?? added[0].id);
  };

  const clear = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    setFiles([]);
    setSelectedId(undefined);
    setSettings({});
    setAllSettings(defaults());
    setApplyAll(false);
    setPreview(undefined);
    setPreviewSize(undefined);
    setProcessing(false);
  };

  const remove = (id: string) => {
    const item = files.find((f) => f.id === id);
    if (item) URL.revokeObjectURL(item.preview);
    const next = files.filter((f) => f.id !== id);
    setFiles(next);
    setSelectedId((v) => (v === id ? next[0]?.id : v));
    setSettings((v) => {
      const n = { ...v };
      delete n[id];
      return n;
    });
  };

  const process = async () => {
    if (!files.length || processing || !valid) return;
    setProcessing(true);
    setFiles((v) => v.map((f) => ({ ...f, status: "processing", error: undefined })));
    for (const item of files) {
      try {
        const itemSettings = applyAll ? allSettings : (settings[item.id] ?? defaults());
        const q = Number(itemSettings.quality);
        if (!(q >= 1 && q <= 100)) {
          throw new Error("Enter a quality between 1 and 100.");
        }
        const blob = await compress(item.file, q);
        if (item.id === selectedId) setPreviewSize(blob.size);
        setFiles((v) =>
          v.map((f) =>
            f.id === item.id
              ? { ...f, status: "done", output: blob, outputName: outputName(f.file.name) }
              : f
          )
        );
      } catch (e) {
        setFiles((v) =>
          v.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: "error",
                  error: e instanceof Error ? e.message : "Unable to compress image.",
                }
              : f
          )
        );
      }
    }
    setProcessing(false);
  };

  const download = (item: ImageItem) => {
    if (!item.output || !item.outputName) return;
    const url = URL.createObjectURL(item.output);
    const link = document.createElement("a");
    link.href = url;
    link.download = item.outputName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadAll = () => {
    const ready = files.filter((f) => f.output && f.outputName);
    ready.forEach((item, index) => window.setTimeout(() => download(item), index * 120));
  };

  const reset = () =>
    setFiles((v) =>
      v.map((f) => ({
        ...f,
        status: "ready",
        output: undefined,
        outputName: undefined,
        error: undefined,
      }))
    );
  return (
    <div className="compress-page">
      <header>
        <button className="back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="eyebrow">Image tools</div>
        <h1>Compress images</h1>
        <p>Reduce image file size while controlling output quality.</p>
      </header>
      <main className="card">
        {!files.length ? (
          <label className="drop">
            <Upload size={25} />
            <b>Drop images here</b>
            <span>or click to browse</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => {
                if (e.target.files) void add(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        ) : (
          <>
            <div className="filebar">
              <span>
                {files.length} {files.length === 1 ? "image" : "images"}
              </span>
              <div>
                <label className="mini">
                  <Upload size={13} /> Add
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) void add(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button className="mini" onClick={clear}>
                  <Trash2 size={13} /> Clear
                </button>
              </div>
            </div>
            <div className="thumbs">
              {files.map((f) => (
                <button
                  key={f.id}
                  className={`thumb ${f.id === selectedId ? "selected" : ""}`}
                  onClick={() => setSelectedId(f.id)}>
                  <img src={f.preview} alt="" />
                  <span>
                    <b>{f.file.name}</b>
                    <small>
                      {f.width} × {f.height}
                      {f.status === "done" ? " · Done" : f.status === "error" ? " · Error" : ""}
                    </small>
                  </span>
                  {f.status === "done" && <Check size={14} />}{" "}
                  {files.length > 1 && (
                    <i
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(f.id);
                      }}>
                      ×
                    </i>
                  )}
                </button>
              ))}
            </div>
            {selected && current && (
              <>
                <div className="preview">
                  <img src={preview || selected.preview} alt={selected.file.name} />
                </div>
                <section className="settings">
                  <div className="settings-head">
                    <div>
                      <b>Compress</b>
                      <span>{selected.file.name}</span>
                    </div>
                    {files.length > 1 && (
                      <button
                        className={`apply ${applyAll ? "on" : ""}`}
                        role="switch"
                        aria-checked={applyAll}
                        onClick={() => {
                          if (!applyAll) setAllSettings(current ?? defaults());
                          setApplyAll((v) => !v);
                        }}>
                        <i />
                        <strong>Apply to all</strong>
                      </button>
                    )}
                  </div>
                  <div className="controls">
                    <div className="quality-row">
                      <label>Quality · {format.toUpperCase()}</label>
                      <div className="quality-input">
                        <button onClick={() => changeQuality(-5)} aria-label="Decrease quality">
                          <Minus size={14} />
                        </button>
                        <div className="quality-field">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={quality}
                            onChange={(e) =>
                              applyAll
                                ? setAllSettings((v) => ({ ...v, quality: e.target.value }))
                                : update(e.target.value)
                            }
                          />
                          <span>%</span>
                        </div>
                        <button onClick={() => changeQuality(5)} aria-label="Increase quality">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="sizes">
                    <span>
                      <b>Original</b>
                      <strong>{formatBytes(selected.file.size)}</strong>
                    </span>
                    <span>
                      <b>Preview</b>
                      <strong>{previewSize ? formatBytes(previewSize) : "—"}</strong>
                    </span>
                    <span>
                      <b>Saved</b>
                      <strong>
                        {previewSize
                          ? `${Math.max(0, Math.round((1 - previewSize / selected.file.size) * 100))}%`
                          : "—"}
                      </strong>
                    </span>
                  </div>
                  <p className="hint">
                    JPEG and WebP use quality. PNG uses color quantization at lower quality
                    settings. Output keeps the original format.
                  </p>
                  {!valid && <p className="error">Enter a quality between 1 and 100.</p>}
                  {selected.error && <p className="error">{selected.error}</p>}
                </section>
                <div className="actions">
                  <button className="button" onClick={reset} disabled={processing}>
                    Reset
                  </button>
                  {selected.output && (
                    <button className="button" onClick={() => download(selected)}>
                      <Download size={14} /> Download
                    </button>
                  )}
                  {files.some((f) => f.output) && (
                    <button className="button" onClick={downloadAll}>
                      <Download size={14} /> Download all
                    </button>
                  )}
                  <button
                    className="button primary"
                    onClick={() => void process()}
                    disabled={processing || !valid}>
                    {processing ? "Processing…" : "Compress images"}
                  </button>
                </div>
                <Processing files={files} processing={processing} />
              </>
            )}
          </>
        )}
      </main>
      <section className="privacy">
        <Check size={16} />
        <div>
          <b>Processed locally</b>
          <span>Your images are processed directly in your browser and are never uploaded.</span>
        </div>
      </section>
    </div>
  );
}
