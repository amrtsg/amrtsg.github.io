import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Download, Link, Trash2, Unlink, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./tools.css";

type Status = "ready" | "processing" | "done" | "error";
type Settings = { width: string; height: string; keepAspect: boolean };
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

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const nameFor = (name: string) => `${name.replace(/\.[^.]+$/, "")}-resized.png`;

async function image(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Unable to read image."));
      el.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function resize(file: File, width: number, height: number) {
  const img = await image(file);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to create image canvas.");
  ctx.drawImage(img, 0, 0, width, height);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Unable to resize image."))),
      "image/png"
    )
  );
}

const save = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
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

export default function ImageResizePage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [settings, setSettings] = useState<Record<string, Settings>>({});
  const [applyAll, setApplyAll] = useState(false);
  const [all, setAll] = useState<Settings>({ width: "", height: "", keepAspect: false });
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<string>();
  const previewUrl = useRef<string | null>(null);

  const selected = files.find((f) => f.id === selectedId);
  const current =
    selected &&
    (settings[selected.id] ?? {
      width: String(selected.width),
      height: String(selected.height),
      keepAspect: true,
    });
  const active = applyAll ? all : current;

  useEffect(
    () => () => {
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    },
    []
  );

  const add = async (input: FileList | File[]) => {
    const added: ImageItem[] = [];
    for (const file of Array.from(input).filter((f) => f.type.startsWith("image/"))) {
      try {
        const img = await image(file);
        added.push({
          id: makeId(),
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
    if (!all.width)
      setAll({ width: String(added[0].width), height: String(added[0].height), keepAspect: false });
  };

  const clear = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    setFiles([]);
    setSelectedId(undefined);
    setSettings({});
    setPreview(undefined);
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

  const update = (changes: Partial<Settings>) => {
    if (!selected || !current) return;
    setSettings((v) => ({ ...v, [selected.id]: { ...current, ...changes } }));
  };

  const width = (value: string) =>
    update({
      width: value,
      height:
        current?.keepAspect && Number(value) > 0
          ? String(Math.max(1, Math.round((Number(value) * selected!.height) / selected!.width)))
          : (current?.height ?? ""),
    });
  const height = (value: string) =>
    update({
      height: value,
      width:
        current?.keepAspect && Number(value) > 0
          ? String(Math.max(1, Math.round((Number(value) * selected!.width) / selected!.height)))
          : (current?.width ?? ""),
    });

  const size = (item: ImageItem, s?: Settings) => {
    if (!s) return null;
    const w = Math.round(Number(s.width));
    const h = Math.round(
      !applyAll && s.keepAspect ? (Number(s.width) * item.height) / item.width : Number(s.height)
    );
    return w > 0 && h > 0 ? { width: w, height: h } : null;
  };

  useEffect(() => {
    if (!selected || !active) return setPreview(undefined);
    const target = size(selected, active);
    if (!target) return setPreview(undefined);
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const blob = await resize(selected.file, target.width, target.height);
        if (cancelled) return;
        if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
        previewUrl.current = URL.createObjectURL(blob);
        setPreview(previewUrl.current);
      } catch {
        if (!cancelled) setPreview(undefined);
      }
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selected?.id, selected?.file, active?.width, active?.height, active?.keepAspect, applyAll]);

  const process = async () => {
    if (!files.length || processing) return;
    setProcessing(true);
    setFiles((v) => v.map((f) => ({ ...f, status: "processing", error: undefined })));
    for (const item of files) {
      try {
        const s = applyAll
          ? all
          : (settings[item.id] ?? {
              width: String(item.width),
              height: String(item.height),
              keepAspect: true,
            });
        const target = size(item, s);
        if (!target) throw new Error("Enter valid dimensions.");
        const blob = await resize(item.file, target.width, target.height);
        setFiles((v) =>
          v.map((f) =>
            f.id === item.id
              ? { ...f, status: "done", output: blob, outputName: nameFor(f.file.name) }
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
                  error: e instanceof Error ? e.message : "Unable to resize image.",
                }
              : f
          )
        );
      }
    }
    setProcessing(false);
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
  const target = selected ? size(selected, active) : null;
  const download = () => {
    if (selected?.output && selected.outputName) save(selected.output, selected.outputName);
  };
  const downloadAll = () =>
    files
      .filter((f) => f.output && f.outputName)
      .forEach((f, i) => setTimeout(() => save(f.output!, f.outputName!), i * 120));

  return (
    <div className="resize-page">
      <header>
        <button className="back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="eyebrow">Image tools</div>
        <h1>Resize images</h1>
        <p>Resize one or multiple images in your browser.</p>
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
                      <b>Resize</b>
                      <span>{selected.file.name}</span>
                    </div>
                    {files.length > 1 && (
                      <label className="apply">
                        <input
                          type="checkbox"
                          checked={applyAll}
                          onChange={(e) => {
                            const on = e.target.checked;
                            if (on)
                              setAll({
                                width: current.width,
                                height: current.height,
                                keepAspect: false,
                              });
                            setApplyAll(on);
                          }}
                        />
                        <strong>Apply to all</strong>
                      </label>
                    )}
                  </div>

                  {applyAll ? (
                    <div className="all-box">
                      <div>
                        <b>All images</b>
                        <span>Use the same exact output size for every image.</span>
                      </div>
                      <div className="fields">
                        <label>
                          Width
                          <input
                            type="number"
                            min="1"
                            value={all.width}
                            onChange={(e) => setAll((v) => ({ ...v, width: e.target.value }))}
                          />
                        </label>
                        <label>
                          Height
                          <input
                            type="number"
                            min="1"
                            value={all.height}
                            onChange={(e) => setAll((v) => ({ ...v, height: e.target.value }))}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="fields">
                      <label>
                        Width
                        <input
                          type="number"
                          min="1"
                          value={current.width}
                          onChange={(e) => width(e.target.value)}
                        />
                      </label>
                      <button
                        className={`aspect ${current.keepAspect ? "on" : ""}`}
                        onClick={() => update({ keepAspect: !current.keepAspect })}
                        title="Keep aspect ratio">
                        {current.keepAspect ? <Link size={15} /> : <Unlink size={15} />}
                      </button>
                      <label>
                        Height
                        <input
                          type="number"
                          min="1"
                          value={current.height}
                          onChange={(e) => height(e.target.value)}
                        />
                      </label>
                    </div>
                  )}

                  <div className="sizes">
                    <span>
                      Original{" "}
                      <b>
                        {selected.width} × {selected.height}
                      </b>
                    </span>
                    <span>
                      Output <b>{target ? `${target.width} × ${target.height}` : "—"}</b>
                    </span>
                  </div>
                  {selected.error && <p className="error">{selected.error}</p>}
                </section>

                <div className="actions">
                  <button className="button" onClick={reset} disabled={processing}>
                    Reset
                  </button>
                  {selected?.output && (
                    <button className="button" onClick={download}>
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
                    {processing ? "Processing…" : "Resize images"}
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
