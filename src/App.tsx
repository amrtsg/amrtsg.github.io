import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import About from "./pages/About";
import Tools from "./pages/Tools";
import Projects from "./pages/Projects";

import Converter from "./tools/converters/Converter";

import ImageResize from "./tools/image-tools/ImageResize";
import ImageCompress from "./tools/image-tools/ImageCompress";
import ImageCrop from "./tools/image-tools/ImageCrop";
import ImageRotate from "./tools/image-tools/ImageRotate";
import BackRemove from "./tools/image-tools/BackRemove";

import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      // Main page
      {
        index: true,
        element: <About />,
      },

      // Pages
      {
        path: "tools",
        element: <Tools />,
      },
      {
        path: "projects",
        element: <Projects />,
      },

      // Image converters
      {
        path: "tools/png-to-jpeg",
        element: <Converter tool="png-to-jpeg" />,
      },
      {
        path: "tools/jpeg-to-png",
        element: <Converter tool="jpeg-to-png" />,
      },
      {
        path: "tools/png-to-webp",
        element: <Converter tool="png-to-webp" />,
      },
      {
        path: "tools/webp-to-png",
        element: <Converter tool="webp-to-png" />,
      },
      {
        path: "tools/jpeg-to-webp",
        element: <Converter tool="jpeg-to-webp" />,
      },
      {
        path: "tools/webp-to-jpeg",
        element: <Converter tool="webp-to-jpeg" />,
      },
      {
        path: "tools/svg-to-png",
        element: <Converter tool="svg-to-png" />,
      },
      {
        path: "tools/bmp-to-png",
        element: <Converter tool="bmp-to-png" />,
      },
      {
        path: "tools/tiff-to-png",
        element: <Converter tool="tiff-to-png" />,
      },
      {
        path: "tools/heic-to-jpeg",
        element: <Converter tool="heic-to-jpeg" />,
      },

      // Image tools
      {
        path: "tools/image-resize",
        element: <ImageResize />,
      },
      {
        path: "tools/image-compress",
        element: <ImageCompress />,
      },
      {
        path: "tools/image-crop",
        element: <ImageCrop />,
      },
      {
        path: "tools/image-rotate",
        element: <ImageRotate />,
      },
      {
        path: "tools/image-background-remove",
        element: <BackRemove />,
      },

      // Document converters
      {
        path: "tools/docx-to-pdf",
        element: <Converter tool="docx-to-pdf" />,
      },
      {
        path: "tools/txt-to-pdf",
        element: <Converter tool="txt-to-pdf" />,
      },
      {
        path: "tools/rtf-to-pdf",
        element: <Converter tool="rtf-to-pdf" />,
      },
      {
        path: "tools/html-to-pdf",
        element: <Converter tool="html-to-pdf" />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
