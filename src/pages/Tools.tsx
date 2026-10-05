import { useMemo, useState } from "react";
import {
  Archive,
  ArrowRight,
  FileCode2,
  FileImage,
  FileText,
  Image,
  Search,
  ScanText,
  Settings2,
  SlidersHorizontal,
  Wrench,
  X,
} from "lucide-react";
import "./pages.css";
import { useNavigate } from "react-router-dom";

interface Tool {
  name: string;
  description: string;
  icon: typeof FileImage;
  path?: string;
}

interface ToolCategory {
  name: string;
  description: string;
  icon: typeof FileImage;
  tools: Tool[];
}

const categories: ToolCategory[] = [
  {
    name: "Image Converters",
    description: "Convert images between common formats.",
    icon: Image,
    tools: [
      {
        name: "PNG to JPEG",
        description: "Convert PNG images to JPEG format.",
        icon: FileImage,
        path: "/tools/png-to-jpeg",
      },
      {
        name: "JPEG to PNG",
        description: "Convert JPEG images to PNG format.",
        icon: FileImage,
        path: "/tools/jpeg-to-png",
      },
      {
        name: "PNG to WEBP",
        description: "Convert PNG images to WEBP format.",
        icon: FileImage,
        path: "/tools/png-to-webp",
      },
      {
        name: "WEBP to PNG",
        description: "Convert WEBP images to PNG format.",
        icon: FileImage,
        path: "/tools/webp-to-png",
      },
      {
        name: "JPEG to WEBP",
        description: "Convert JPEG images to WEBP format.",
        icon: FileImage,
        path: "/tools/jpeg-to-webp",
      },
      {
        name: "WEBP to JPEG",
        description: "Convert WEBP images to JPEG format.",
        icon: FileImage,
        path: "/tools/webp-to-jpeg",
      },
      {
        name: "SVG to PNG",
        description: "Convert SVG graphics to PNG images.",
        icon: FileImage,
        path: "/tools/svg-to-png",
      },
      {
        name: "BMP to PNG",
        description: "Convert BMP images to PNG format.",
        icon: FileImage,
        path: "/tools/bmp-to-png",
      },
      {
        name: "TIFF to PNG",
        description: "Convert TIFF images to PNG format.",
        icon: FileImage,
        path: "/tools/tiff-to-png",
      },
      {
        name: "HEIC to JPEG",
        description: "Convert HEIC images to JPEG format.",
        icon: FileImage,
        path: "/tools/heic-to-jpeg",
      },
    ],
  },
  {
    name: "Document Converters",
    description: "Convert documents between practical formats.",
    icon: FileText,
    tools: [
      {
        name: "DOCX to PDF",
        description: "Convert Word documents to PDF files.",
        icon: FileText,
        path: "/tools/docx-to-pdf",
      },
      {
        name: "TXT to PDF",
        description: "Convert plain text files to PDF documents.",
        icon: FileText,
        path: "/tools/txt-to-pdf",
      },
      {
        name: "RTF to PDF",
        description: "Convert rich text documents to PDF files.",
        icon: FileText,
        path: "/tools/rtf-to-pdf",
      },
      {
        name: "HTML to PDF",
        description: "Convert HTML documents into PDF files.",
        icon: FileCode2,
        path: "/tools/html-to-pdf",
      },
    ],
  },
  {
    name: "Image Tools",
    description: "Utilities for working with and modifying images.",
    icon: Settings2,
    tools: [
      {
        name: "Image Resizer",
        description: "Resize images to custom dimensions.",
        icon: ScanText,
        path: "/tools/image-resize",
      },
      {
        name: "Image Compressor",
        description: "Reduce image file size while preserving quality.",
        icon: Archive,
        path: "/tools/image-compress",
      },
      {
        name: "Image Cropper",
        description: "Crop images to custom dimensions.",
        icon: Image,
        path: "/tools/image-crop",
      },
      {
        name: "Image Rotator",
        description: "Rotate and flip images.",
        icon: Image,
        path: "/tools/image-rotate",
      },
      {
        name: "Background Remover",
        description: "Remove image backgrounds and export transparent PNGs.",
        icon: Image,
        path: "/tools/image-background-remove",
      },
    ],
  },
];

function Tools() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories
      .filter((category) => selectedCategory === "All" || category.name === selectedCategory)
      .map((category) => {
        if (!query) {
          return category;
        }

        const categoryMatches =
          category.name.toLowerCase().includes(query) || category.description.toLowerCase().includes(query);

        const filteredTools = category.tools.filter(
          (tool) => tool.name.toLowerCase().includes(query) || tool.description.toLowerCase().includes(query)
        );

        return {
          ...category,
          tools: categoryMatches ? category.tools : filteredTools,
        };
      })
      .filter((category) => category.tools.length > 0);
  }, [search, selectedCategory]);

  const totalTools = categories.reduce((total, category) => total + category.tools.length, 0);

  const visibleTools = filteredCategories.reduce((total, category) => total + category.tools.length, 0);

  const hasFilters = search.trim() !== "" || selectedCategory !== "All";

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
  };

  const openTool = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <>
      <div className="page tools-page">
        <header className="topbar">
          <div>
            <div className="eyebrow">Developer workspace</div>
            <h1>Tools</h1>
            <p>Simple browser-based utilities for files, images, data, and development.</p>
          </div>

          <div className="topbar-badge">
            <Wrench size={16} />
            {totalTools} tools
          </div>
        </header>

        <section className="tools-intro">
          <div className="tools-intro-icon">
            <Wrench size={22} />
          </div>

          <div>
            <h2>Useful tools, all in one place.</h2>
            <p>
              Fast utilities designed to handle common file, image, data, and development tasks directly in your
              browser.
            </p>
          </div>
        </section>

        <section className="tools-controls">
          <div className="tools-search">
            <Search size={18} className="tools-search-icon" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tools, formats, or tasks..."
              aria-label="Search tools"
            />

            {search && (
              <button
                type="button"
                className="tools-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          <div className="tools-filter-label">
            <SlidersHorizontal size={15} />
            <span>Filter by category</span>
          </div>

          <div className="tools-category-filters">
            <button
              type="button"
              className={`tools-filter-button ${selectedCategory === "All" ? "active" : ""}`}
              onClick={() => setSelectedCategory("All")}>
              All
              <span>{totalTools}</span>
            </button>

            {categories.map((category) => (
              <button
                key={category.name}
                type="button"
                className={`tools-filter-button ${selectedCategory === category.name ? "active" : ""}`}
                onClick={() => setSelectedCategory(category.name)}>
                {category.name}
                <span>{category.tools.length}</span>
              </button>
            ))}
          </div>
        </section>

        {hasFilters && (
          <div className="tools-results">
            <span>
              Showing <strong>{visibleTools}</strong> of {totalTools} tools
            </span>

            <button type="button" onClick={clearFilters}>
              Clear filters
              <X size={13} />
            </button>
          </div>
        )}

        {filteredCategories.length > 0 ? (
          <div className="tools-categories">
            {filteredCategories.map((category) => {
              const CategoryIcon = category.icon;

              return (
                <section className="tools-category-section" key={category.name}>
                  <div className="tool-category-header">
                    <div className="tool-category-title">
                      <div className="tool-category-icon">
                        <CategoryIcon size={18} />
                      </div>

                      <div>
                        <h2>{category.name}</h2>
                        <p>{category.description}</p>
                      </div>
                    </div>

                    <span className="tool-category-count">{category.tools.length} tools</span>
                  </div>

                  <div className="tool-directory-grid">
                    {category.tools.map((tool) => {
                      const ToolIcon = tool.icon;

                      return (
                        <button
                          className="tool-directory-card"
                          key={tool.name}
                          type="button"
                          onClick={() => openTool(tool.path)}
                          disabled={!tool.path}>
                          <div className="tool-directory-card-top">
                            <div className="tool-directory-icon">
                              <ToolIcon size={19} />
                            </div>

                            <ArrowRight size={17} className="tool-directory-arrow" />
                          </div>

                          <h3>{tool.name}</h3>
                          <p>{tool.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="tools-empty">
            <div className="tools-empty-icon">
              <Search size={19} />
            </div>

            <h2>No tools found</h2>
            <p>Try changing your search or category filter.</p>

            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Tools;
