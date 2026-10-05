import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Download, FileText, LoaderCircle, Upload, X } from "lucide-react";

import "./converter.css";

import { convertPNGtoJPEG } from "./image-converters/PNGtoJPEG";
import { convertJPEGtoPNG } from "./image-converters/JPEGtoPNG";
import { convertPNGtoWEBP } from "./image-converters/PNGtoWEBP";
import { convertWEBPtoPNG } from "./image-converters/WEBPtoPNG";
import { convertJPEGtoWEBP } from "./image-converters/JPEGtoWEBP";
import { convertWEBPtoJPEG } from "./image-converters/WEBPtoJPEG";
import { convertSVGtoPNG } from "./image-converters/SVGtoPNG";
import { convertBMPtoPNG } from "./image-converters/BMPtoPNG";
import { convertTIFFtoPNG } from "./image-converters/TIFFtoPNG";
import { convertHEICtoJPEG } from "./image-converters/HEICtoJPEG";

import { convertDOCXToPDF } from "./document-converters/DOCXToPDF";
import { convertTXTToPDF } from "./document-converters/TXTToPDF";
import { convertRTFToPDF } from "./document-converters/RTFToPDF";
import { convertHTMLToPDF } from "./document-converters/HTMLToPDF";

export type ConverterType =
  | "png-to-jpeg"
  | "jpeg-to-png"
  | "png-to-webp"
  | "webp-to-png"
  | "jpeg-to-webp"
  | "webp-to-jpeg"
  | "svg-to-png"
  | "bmp-to-png"
  | "tiff-to-png"
  | "heic-to-jpeg"
  | "docx-to-pdf"
  | "txt-to-pdf"
  | "rtf-to-pdf"
  | "html-to-pdf";

export type ConverterStatus = "ready" | "processing" | "complete" | "error";

type Config = {
  title: string;
  description: string;
  category: string;
  source: string;
  target: string;
  accept: string;
  convert: (file: File) => Promise<Blob>;
};

type Item = {
  id: string;
  file: File;
  result?: Blob;
  resultName?: string;
  status: ConverterStatus;
  error?: string;
};

type Props = {
  tool: ConverterType;
};

const CONVERTERS: Record<ConverterType, Config> = {
  "png-to-jpeg": {
    title: "PNG to JPEG",
    description: "Convert PNG images to JPEG format directly in your browser.",
    category: "Image Converter",
    source: "PNG",
    target: "JPEG",
    accept: ".png",
    convert: convertPNGtoJPEG,
  },
  "jpeg-to-png": {
    title: "JPEG to PNG",
    description: "Convert JPEG images to PNG format directly in your browser.",
    category: "Image Converter",
    source: "JPEG",
    target: "PNG",
    accept: ".jpg,.jpeg",
    convert: convertJPEGtoPNG,
  },
  "png-to-webp": {
    title: "PNG to WEBP",
    description: "Convert PNG images to WEBP format directly in your browser.",
    category: "Image Converter",
    source: "PNG",
    target: "WEBP",
    accept: ".png",
    convert: convertPNGtoWEBP,
  },
  "webp-to-png": {
    title: "WEBP to PNG",
    description: "Convert WEBP images to PNG format directly in your browser.",
    category: "Image Converter",
    source: "WEBP",
    target: "PNG",
    accept: ".webp",
    convert: convertWEBPtoPNG,
  },
  "jpeg-to-webp": {
    title: "JPEG to WEBP",
    description: "Convert JPEG images to WEBP format directly in your browser.",
    category: "Image Converter",
    source: "JPEG",
    target: "WEBP",
    accept: ".jpg,.jpeg",
    convert: convertJPEGtoWEBP,
  },
  "webp-to-jpeg": {
    title: "WEBP to JPEG",
    description: "Convert WEBP images to JPEG format directly in your browser.",
    category: "Image Converter",
    source: "WEBP",
    target: "JPEG",
    accept: ".webp",
    convert: convertWEBPtoJPEG,
  },
  "svg-to-png": {
    title: "SVG to PNG",
    description: "Convert SVG images to PNG format directly in your browser.",
    category: "Image Converter",
    source: "SVG",
    target: "PNG",
    accept: ".svg",
    convert: convertSVGtoPNG,
  },
  "bmp-to-png": {
    title: "BMP to PNG",
    description: "Convert BMP images to PNG format directly in your browser.",
    category: "Image Converter",
    source: "BMP",
    target: "PNG",
    accept: ".bmp",
    convert: convertBMPtoPNG,
  },
  "tiff-to-png": {
    title: "TIFF to PNG",
    description: "Convert TIFF images to PNG format directly in your browser.",
    category: "Image Converter",
    source: "TIFF",
    target: "PNG",
    accept: ".tif,.tiff",
    convert: convertTIFFtoPNG,
  },
  "heic-to-jpeg": {
    title: "HEIC to JPEG",
    description: "Convert HEIC images to JPEG format directly in your browser.",
    category: "Image Converter",
    source: "HEIC",
    target: "JPEG",
    accept: ".heic,.heif",
    convert: convertHEICtoJPEG,
  },
  "docx-to-pdf": {
    title: "DOCX to PDF",
    description: "Convert DOCX documents to PDF directly in your browser.",
    category: "Document Converter",
    source: "DOCX",
    target: "PDF",
    accept: ".docx",
    convert: convertDOCXToPDF,
  },
  "txt-to-pdf": {
    title: "TXT to PDF",
    description: "Convert text files to PDF directly in your browser.",
    category: "Document Converter",
    source: "TXT",
    target: "PDF",
    accept: ".txt",
    convert: convertTXTToPDF,
  },
  "rtf-to-pdf": {
    title: "RTF to PDF",
    description: "Convert RTF documents to PDF directly in your browser.",
    category: "Document Converter",
    source: "RTF",
    target: "PDF",
    accept: ".rtf",
    convert: convertRTFToPDF,
  },
  "html-to-pdf": {
    title: "HTML to PDF",
    description: "Convert HTML files to PDF directly in your browser.",
    category: "Document Converter",
    source: "HTML",
    target: "PDF",
    accept: ".html,.htm",
    convert: convertHTMLToPDF,
  },
};

const size = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1048576
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1048576).toFixed(2)} MB`;

function Converter({ tool }: Props) {
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const config = CONVERTERS[tool];

  const [files, setFiles] = useState<Item[]>([]);
  const [drag, setDrag] = useState(false);
  const [processing, setProcessing] = useState(false);

  const add = (list: File[]) => {
    const accepted = config.accept.split(",").map((extension) => extension.trim().toLowerCase());

    const items = list
      .filter((file) => {
        const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
        return accepted.includes(extension);
      })
      .map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        status: "ready" as ConverterStatus,
      }));

    setFiles((current) => [...current, ...items]);
  };

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    add([...(event.target.files ?? [])]);
    event.target.value = "";
  };

  const drop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDrag(false);
    add([...event.dataTransfer.files]);
  };

  const convert = async () => {
    if (processing || files.length === 0) return;

    setProcessing(true);

    for (const item of files) {
      if (item.status === "complete") continue;

      setFiles((current) =>
        current.map((file) =>
          file.id === item.id ? { ...file, status: "processing", error: undefined } : file
        )
      );

      try {
        const result = await config.convert(item.file);
        const name = item.file.name.replace(/\.[^/.]+$/, "");

        setFiles((current) =>
          current.map((file) =>
            file.id === item.id
              ? {
                  ...file,
                  result,
                  resultName: `${name}.${config.target.toLowerCase()}`,
                  status: "complete",
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
                  error: error instanceof Error ? error.message : "Conversion failed.",
                }
              : file
          )
        );
      }
    }

    setProcessing(false);
  };

  const download = (item: Item) => {
    if (!item.result || !item.resultName) return;

    const url = URL.createObjectURL(item.result);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = item.resultName;
    anchor.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadAll = () =>
    files
      .filter((file) => file.result)
      .forEach((file, index) => setTimeout(() => download(file), index * 150));

  const remove = (id: string) => setFiles((current) => current.filter((file) => file.id !== id));

  const reset = () =>
    setFiles((current) =>
      current.map((file) => ({
        ...file,
        status: "ready",
        result: undefined,
        resultName: undefined,
        error: undefined,
      }))
    );

  const clear = () => setFiles([]);

  const done = files.filter((file) => file.status === "complete").length;
  const failed = files.filter((file) => file.status === "error").length;
  const progress = files.length ? Math.round((done / files.length) * 100) : 0;

  return (
    <div className="page converter">
      <header>
        <button className="back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back
        </button>

        <div className="eyebrow">{config.category}</div>
        <h1>{config.title}</h1>
        <p>{config.description}</p>
      </header>

      <section className="card">
        <div
          className={`drop ${drag ? "active" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={drop}
          onClick={() => input.current?.click()}>
          <input ref={input} type="file" accept={config.accept} multiple hidden onChange={change} />

          <div className="upload">
            <Upload size={21} />
          </div>

          <h2>Drop {config.source} files here</h2>
          <p>Choose one or multiple {config.source} files from your computer.</p>
          <span className="browse">Choose files</span>
        </div>
      </section>

      {files.length > 0 && (
        <section className="card files">
          <div className="files-head">
            <div>
              <div className="eyebrow">Selected Files</div>
              <h2>
                {files.length} {files.length === 1 ? "file" : "files"}
              </h2>
            </div>

            <button className="clear" onClick={clear}>
              <X size={14} /> Clear all
            </button>
          </div>

          <div className="list">
            {files.map((item) => (
              <div className="file" key={item.id}>
                <div className="icon">
                  <FileText size={17} />
                </div>

                <div className="info">
                  <strong>{item.file.name}</strong>
                  <span>{size(item.file.size)}</span>
                  {item.error && <small>{item.error}</small>}
                </div>

                <div className="status">
                  {item.status === "ready" && "Ready"}
                  {item.status === "processing" && (
                    <>
                      <LoaderCircle size={13} className="spin" /> Converting
                    </>
                  )}
                  {item.status === "complete" && (
                    <>
                      <CheckCircle2 size={13} /> Complete
                    </>
                  )}
                  {item.status === "error" && "Failed"}
                </div>

                {item.result ? (
                  <button className="download" onClick={() => download(item)}>
                    <Download size={13} /> Download
                  </button>
                ) : (
                  <button className="remove" onClick={() => remove(item.id)} disabled={processing}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="actions">
            <button className="process" onClick={convert} disabled={processing}>
              {processing ? (
                <>
                  <LoaderCircle size={15} className="spin" /> Converting...
                </>
              ) : (
                <>
                  <FileText size={15} /> Convert to {config.target}
                </>
              )}
            </button>

            {done > 0 && (
              <>
                <button className="secondary" onClick={downloadAll}>
                  <Download size={15} /> Download all
                </button>
                <button className="secondary" onClick={reset}>
                  Reset
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {files.length > 0 && (
        <section className="processing">
          <div className="processing-head">
            <div>
              <div className="eyebrow">Processing</div>
              <strong>
                {processing
                  ? `Converting ${config.source.toLowerCase()} files...`
                  : done === files.length
                    ? "Conversion complete"
                    : "Ready to convert"}
              </strong>
            </div>
            <span>
              {done}/{files.length}
            </span>
          </div>

          <div className="bar">
            <i style={{ width: `${progress}%` }} />
          </div>

          <div className="summary">
            {done} complete{failed ? ` · ${failed} failed` : ""}
            {processing ? " · Processing locally" : ""}
          </div>
        </section>
      )}

      <section className="privacy">
        <CheckCircle2 size={16} />
        <div>
          <strong>Processed locally</strong>
          <p>Your files are processed directly in your browser and are never uploaded.</p>
        </div>
      </section>
    </div>
  );
}

export default Converter;
