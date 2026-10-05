import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Download, Minus, Plus, RotateCcw, Trash2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./tools.css";

type Status = "ready" | "processing" | "done" | "error";
type Mode = "ratio" | "pixels";
type Settings = {
  mode: Mode;
  ratio: string;
  ratioWidth: string;
  ratioHeight: string;
  width: string;
  height: string;
};
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
const ratios = ["1:1", "4:3", "3:4", "16:9", "9:16"];
const defaults = (f: ImageItem): Settings => ({
  mode: "ratio",
  ratio: "original",
  ratioWidth: "1",
  ratioHeight: "1",
  width: String(f.width),
  height: String(f.height),
});
const outputName = (n: string) => `${n.replace(/\.[^.]+$/, "")}-cropped.png`;
const bytes = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1048576
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1048576).toFixed(2)} MB`;

async function image(file: File) {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Unable to read image."));
      i.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
function cropSize(s: Settings, w: number, h: number) {
  if (s.mode === "pixels") {
    const cw = Number(s.width),
      ch = Number(s.height);
    if (!Number.isFinite(cw) || !Number.isFinite(ch) || cw <= 0 || ch <= 0) return null;
    return { width: Math.min(w, Math.round(cw)), height: Math.min(h, Math.round(ch)) };
  }
  if (s.ratio === "original") return { width: w, height: h };
  const [rw, rh] =
    s.ratio === "custom"
      ? [Number(s.ratioWidth), Number(s.ratioHeight)]
      : s.ratio.split(":").map(Number);
  if (!(rw > 0 && rh > 0)) return null;
  const r = rw / rh,
    ir = w / h;
  return ir > r
    ? { width: Math.max(1, Math.round(h * r)), height: h }
    : { width: w, height: Math.max(1, Math.round(w / r)) };
}
async function crop(file: File, s: Settings) {
  const img = await image(file),
    c = cropSize(s, img.naturalWidth, img.naturalHeight);
  if (!c) throw new Error("Enter a valid crop size or ratio.");
  const canvas = document.createElement("canvas");
  canvas.width = c.width;
  canvas.height = c.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to create image canvas.");
  ctx.drawImage(
    img,
    Math.round((img.naturalWidth - c.width) / 2),
    Math.round((img.naturalHeight - c.height) / 2),
    c.width,
    c.height,
    0,
    0,
    c.width,
    c.height
  );
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Unable to crop image."))), "image/png")
  );
}
const save = (blob: Blob, name: string) => {
  const u = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 500);
};

function Processing({ files, processing }: { files: ImageItem[]; processing: boolean }) {
  const done = files.filter((f) => f.status === "done").length,
    failed = files.filter((f) => f.status === "error").length,
    complete = files.length > 0 && done === files.length;
  const title = processing
    ? "Processing images"
    : complete
      ? "Processing complete"
      : failed
        ? "Finished with errors"
        : "Processing";
  const sub = processing
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
          <span>{sub}</span>
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
            <span className={`dot ${f.status}`} />
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

export default function ImageCropPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<ImageItem[]>([]),
    [selectedId, setSelectedId] = useState<string>(),
    [settings, setSettings] = useState<Record<string, Settings>>({});
  const [applyAll, setApplyAll] = useState(false),
    [all, setAll] = useState<Settings>({
      mode: "ratio",
      ratio: "original",
      ratioWidth: "1",
      ratioHeight: "1",
      width: "",
      height: "",
    }),
    [processing, setProcessing] = useState(false),
    [preview, setPreview] = useState<string>(),
    [previewSize, setPreviewSize] = useState<number>();
  const previewUrl = useRef<string | null>(null),
    selected = files.find((f) => f.id === selectedId);
  const current = selected ? (settings[selected.id] ?? defaults(selected)) : undefined,
    active = applyAll ? all : (current ?? all);
  const target = selected && active ? cropSize(active, selected.width, selected.height) : null;

  useEffect(
    () => () => {
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    },
    []
  );
  useEffect(() => {
    if (!selected || !active || !target) {
      setPreview(undefined);
      setPreviewSize(undefined);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const b = await crop(selected.file, active);
        if (cancelled) return;
        if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
        previewUrl.current = URL.createObjectURL(b);
        setPreview(previewUrl.current);
        setPreviewSize(b.size);
      } catch {
        if (!cancelled) setPreview(undefined);
      }
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [selected?.id, selected?.file, JSON.stringify(active)]);

  const update = (c: Partial<Settings>) => {
    if (!selected || !current) return;
    const next = { ...current, ...c };
    if (applyAll) setAll((v) => ({ ...v, ...c }));
    else setSettings((v) => ({ ...v, [selected.id]: next }));
  };
  const add = async (input: FileList | File[]) => {
    const added: ImageItem[] = [];
    for (const f of Array.from(input).filter((f) => f.type.startsWith("image/"))) {
      try {
        const i = await image(f);
        added.push({
          id: id(),
          file: f,
          preview: URL.createObjectURL(f),
          width: i.naturalWidth,
          height: i.naturalHeight,
          status: "ready",
        });
      } catch {}
    }
    if (!added.length) return;
    setFiles((v) => [...v, ...added]);
    setSelectedId((v) => v ?? added[0].id);
  };
  const remove = (rid: string) => {
    const f = files.find((x) => x.id === rid);
    if (f) URL.revokeObjectURL(f.preview);
    const n = files.filter((x) => x.id !== rid);
    setFiles(n);
    setSelectedId((v) => (v === rid ? n[0]?.id : v));
  };
  const clear = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    setFiles([]);
    setSelectedId(undefined);
    setSettings({});
    setPreview(undefined);
    setPreviewSize(undefined);
    setProcessing(false);
  };
  const process = async () => {
    if (!files.length || processing) return;
    setProcessing(true);
    setFiles((v) => v.map((f) => ({ ...f, status: "processing", error: undefined })));
    for (const f of files) {
      try {
        const s = applyAll ? all : (settings[f.id] ?? defaults(f)),
          b = await crop(f.file, s);
        setFiles((v) =>
          v.map((x) =>
            x.id === f.id
              ? { ...x, status: "done", output: b, outputName: outputName(x.file.name) }
              : x
          )
        );
      } catch (e) {
        setFiles((v) =>
          v.map((x) =>
            x.id === f.id
              ? {
                  ...x,
                  status: "error",
                  error: e instanceof Error ? e.message : "Unable to crop image.",
                }
              : x
          )
        );
      }
    }
    setProcessing(false);
  };
  const reset = () => {
    setFiles((v) =>
      v.map((f) => ({
        ...f,
        status: "ready",
        output: undefined,
        outputName: undefined,
        error: undefined,
      }))
    );
    setPreviewSize(undefined);
  };
  const download = (f: ImageItem) => {
    if (f.output && f.outputName) save(f.output, f.outputName);
  };
  const downloadAll = () =>
    files
      .filter((f) => f.output && f.outputName)
      .forEach((f, i) => setTimeout(() => download(f), i * 120));

  return (
    <div className="crop-page">
      <header>
        <button className="back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="eyebrow">Image tools</div>
        <h1>Crop images</h1>
        <p>Crop one or multiple images in your browser.</p>
      </header>
      <main className="card">
        {!files.length ? (
          <label className="drop">
            <Upload size={25} />
            <b>Drop images here</b>
            <span>or click to browse</span>
            <input
              type="file"
              accept="image/*"
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
                    accept="image/*"
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
                  <img src={f.preview} />
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
                      <b>Crop</b>
                      <span>{selected.file.name}</span>
                    </div>
                    {files.length > 1 && (
                      <label className="apply">
                        <input
                          type="checkbox"
                          checked={applyAll}
                          onChange={(e) => {
                            const on = e.target.checked;
                            if (on) setAll({ ...current });
                            setApplyAll(on);
                          }}
                        />
                        <strong>Apply to all</strong>
                      </label>
                    )}
                  </div>
                  <div className="controls">
                    <label>
                      Crop by
                      <select
                        value={active.mode}
                        onChange={(e) => update({ mode: e.target.value as Mode })}>
                        <option value="ratio">Aspect ratio</option>
                        <option value="pixels">Pixels</option>
                      </select>
                    </label>
                    {active.mode === "ratio" ? (
                      <>
                        <label>
                          Aspect ratio
                          <select
                            value={active.ratio}
                            onChange={(e) => update({ ratio: e.target.value })}>
                            <option value="original">Original</option>
                            {ratios.map((r) => (
                              <option key={r}>{r}</option>
                            ))}
                            <option value="custom">Custom</option>
                          </select>
                        </label>
                        {active.ratio === "custom" && (
                          <div className="fields">
                            <label>
                              Ratio width
                              <input
                                type="number"
                                min="1"
                                value={active.ratioWidth}
                                onChange={(e) => update({ ratioWidth: e.target.value })}
                              />
                            </label>
                            <label>
                              Ratio height
                              <input
                                type="number"
                                min="1"
                                value={active.ratioHeight}
                                onChange={(e) => update({ ratioHeight: e.target.value })}
                              />
                            </label>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="fields">
                        <Field
                          label="Width"
                          value={active.width}
                          max={selected.width}
                          onChange={(v) => update({ width: v })}
                        />
                        <Field
                          label="Height"
                          value={active.height}
                          max={selected.height}
                          onChange={(v) => update({ height: v })}
                        />
                      </div>
                    )}
                  </div>
                  <div className="sizes">
                    <span>
                      Original{" "}
                      <b>
                        {selected.width} × {selected.height}
                      </b>
                    </span>
                    <span>
                      Result <b>{target ? `${target.width} × ${target.height}` : "—"}</b>
                    </span>
                    <span>
                      Size{" "}
                      <b>
                        {selected.output?.size
                          ? bytes(selected.output.size)
                          : previewSize
                            ? bytes(previewSize)
                            : "—"}
                      </b>
                    </span>
                  </div>
                  {!target && <p className="error">Enter a valid size or ratio.</p>}
                </section>
                <div className="actions">
                  <button className="button" onClick={reset} disabled={processing}>
                    <RotateCcw size={14} /> Reset
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
                    disabled={processing || !target}>
                    {processing ? "Processing…" : "Crop images"}
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
function Field({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: string;
  max: number;
  onChange: (v: string) => void;
}) {
  const nudge = (n: number) => {
    const x = Number(value);
    onChange(
      String(
        Math.min(max, Math.max(1, Math.round((value !== "" && Number.isFinite(x) ? x : max) + n)))
      )
    );
  };
  return (
    <label>
      {label}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="button" onClick={() => nudge(-10)}>
          <Minus size={14} />
        </button>
        <input
          type="number"
          min="1"
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className="button" onClick={() => nudge(10)}>
          <Plus size={14} />
        </button>
      </div>
    </label>
  );
}
