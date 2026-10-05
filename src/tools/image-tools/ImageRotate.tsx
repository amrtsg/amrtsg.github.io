import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Download,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./tools.css";

type Status = "ready" | "processing" | "done" | "error";
type Rotation = 0 | 90 | 180 | 270;
type Settings = { rotation: Rotation; flipHorizontal: boolean; flipVertical: boolean };
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
const defaults = (): Settings => ({ rotation: 0, flipHorizontal: false, flipVertical: false });
const outputName = (n: string) => `${n.replace(/\.[^.]+$/, "")}-rotated.png`;

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

async function rotate(file: File, s: Settings) {
  const img = await image(file),
    w = img.naturalWidth,
    h = img.naturalHeight;
  const swap = s.rotation === 90 || s.rotation === 270;
  const canvas = document.createElement("canvas");
  canvas.width = swap ? h : w;
  canvas.height = swap ? w : h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to create image canvas.");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((s.rotation * Math.PI) / 180);
  ctx.scale(s.flipHorizontal ? -1 : 1, s.flipVertical ? -1 : 1);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Unable to rotate image."))),
      "image/png"
    )
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
  const done = files.filter((f) => f.status === "done").length;
  const failed = files.filter((f) => f.status === "error").length;
  const complete = files.length > 0 && done === files.length;
  const title = processing
    ? "Processing images"
    : complete
      ? "Processing complete"
      : failed
        ? "Finished with errors"
        : "Processing status";
  const sub = processing
    ? `Processing image ${Math.min(done + failed + 1, files.length)} of ${files.length}`
    : complete
      ? `${done} ${done === 1 ? "image" : "images"} processed successfully`
      : failed
        ? `${done} processed, ${failed} failed`
        : "Your images are ready to be processed";
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
            <i className={`dot ${f.status}`} />
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

export default function ImageRotatePage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [settings, setSettings] = useState<Record<string, Settings>>({});
  const [applyAll, setApplyAll] = useState(false);
  const [all, setAll] = useState<Settings>(defaults());
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string>();
  const previewUrl = useRef<string | null>(null);
  const selected = files.find((f) => f.id === selectedId);
  const current = selected ? (settings[selected.id] ?? defaults()) : undefined;
  const active = applyAll ? all : current;
  const transformed =
    !!active && (active.rotation !== 0 || active.flipHorizontal || active.flipVertical);

  useEffect(
    () => () => {
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    },
    []
  );

  useEffect(() => {
    if (!selected || !active || !transformed) {
      if (previewUrl.current) {
        URL.revokeObjectURL(previewUrl.current);
        previewUrl.current = null;
      }
      setPreview(undefined);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const blob = await rotate(selected.file, active);
        if (cancelled) return;
        if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
        previewUrl.current = URL.createObjectURL(blob);
        setPreview(previewUrl.current);
      } catch {
        if (!cancelled) setPreview(undefined);
      }
    }, 100);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selected?.id, selected?.file, JSON.stringify(active), transformed]);

  const update = (changes: Partial<Settings>) => {
    if (!selected || !current) return;
    if (applyAll) setAll((v) => ({ ...v, ...changes }));
    else setSettings((v) => ({ ...v, [selected.id]: { ...current, ...changes } }));
    setFiles((v) =>
      v.map((f) =>
        f.id === selected.id || applyAll
          ? {
              ...f,
              status: f.status === "done" || f.status === "error" ? "ready" : f.status,
              output: undefined,
              outputName: undefined,
            }
          : f
      )
    );
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
    setProcessing(false);
    setApplyAll(false);
    setAll(defaults());
  };

  const process = async () => {
    if (!files.length || processing) return;
    setProcessing(true);
    setFiles((v) => v.map((f) => ({ ...f, status: "processing", error: undefined })));
    for (const f of files) {
      try {
        const s = applyAll ? all : (settings[f.id] ?? defaults());
        const b = await rotate(f.file, s);
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
                  error: e instanceof Error ? e.message : "Unable to rotate image.",
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
    setSettings({});
    setApplyAll(false);
    setAll(defaults());
  };
  const download = (f: ImageItem) => {
    if (f.output && f.outputName) save(f.output, f.outputName);
  };
  const downloadAll = () =>
    files
      .filter((f) => f.output && f.outputName)
      .forEach((f, i) => setTimeout(() => download(f), i * 120));

  return (
    <div className="rotate-page">
      <header>
        <button className="back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="eyebrow">Image tools</div>
        <h1>Rotate images</h1>
        <p>Rotate and flip one or multiple images in your browser.</p>
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
                  <img src={f.preview} alt="" />
                  <span>
                    <b>{f.file.name}</b>
                    <small>
                      {f.width} × {f.height}
                      {f.status === "done" ? " · Done" : f.status === "error" ? " · Error" : ""}
                    </small>
                  </span>
                  {f.status === "done" && <Check size={14} />}
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
            {selected && active && (
              <>
                <div className="preview">
                  <img src={preview || selected.preview} alt={selected.file.name} />
                </div>
                <section className="settings">
                  <div className="settings-head">
                    <div>
                      <b>Rotate and flip</b>
                      <span>
                        {files.length > 1
                          ? applyAll
                            ? "These settings apply to every image."
                            : "These settings apply to the selected image only."
                          : selected.file.name}
                      </span>
                    </div>
                    {files.length > 1 && (
                      <label className="apply">
                        <input
                          type="checkbox"
                          checked={applyAll}
                          onChange={(e) => {
                            const on = e.target.checked;
                            if (on) setAll({ ...current! });
                            setApplyAll(on);
                          }}
                        />
                        <strong>Apply to all</strong>
                      </label>
                    )}
                  </div>
                  <div className="controls">
                    <label>
                      Rotation
                      <select
                        value={active.rotation}
                        onChange={(e) => update({ rotation: Number(e.target.value) as Rotation })}>
                        <option value={0}>0°</option>
                        <option value={90}>90°</option>
                        <option value={180}>180°</option>
                        <option value={270}>270°</option>
                      </select>
                    </label>
                    <div className="flip">
                      <span>Flip</span>
                      <div>
                        <button
                          type="button"
                          className={`icon ${active.flipHorizontal ? "active" : ""}`}
                          title="Flip horizontally"
                          onClick={() => update({ flipHorizontal: !active.flipHorizontal })}>
                          <FlipHorizontal size={15} />
                        </button>
                        <button
                          type="button"
                          className={`icon ${active.flipVertical ? "active" : ""}`}
                          title="Flip vertically"
                          onClick={() => update({ flipVertical: !active.flipVertical })}>
                          <FlipVertical size={15} />
                        </button>
                        <button
                          type="button"
                          className="icon"
                          title="Clear rotation and flip"
                          onClick={() => update(defaults())}>
                          <RotateCcw size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="sizes">
                    <span>
                      Original{" "}
                      <b>
                        {selected.width} × {selected.height}
                      </b>
                    </span>
                    <span>
                      Result{" "}
                      <b>
                        {active.rotation === 90 || active.rotation === 270
                          ? `${selected.height} × ${selected.width}`
                          : `${selected.width} × ${selected.height}`}
                      </b>
                    </span>
                  </div>
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
                    disabled={processing}>
                    {processing ? "Processing…" : "Rotate images"}
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
