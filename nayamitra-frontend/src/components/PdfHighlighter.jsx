import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Setup worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfHighlighter({ pdfUrl, activeHighlight }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageDim, setPageDim] = useState(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1.2); // Default scale
  const [initialScaleSet, setInitialScaleSet] = useState(false);

  useEffect(() => {
    if (activeHighlight?.page_num) {
      setPageNumber(activeHighlight.page_num);
    }
  }, [activeHighlight]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function onPageLoadSuccess(page) {
    if (!pageDim || pageDim.width !== page.originalWidth) {
      setPageDim({ width: page.originalWidth, height: page.originalHeight });
    }
  }

  useEffect(() => {
    if (containerRef.current && pageDim && !initialScaleSet) {
      const containerWidth = containerRef.current.clientWidth - 32; 
      const newScale = containerWidth / pageDim.width;
      setScale(newScale);
      setInitialScaleSet(true);
    }
  }, [pageDim, initialScaleSet]);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));

  const getHighlightStyle = () => {
    if (!activeHighlight?.bbox || activeHighlight.page_num !== pageNumber || !pageDim) return { display: 'none' };
    const [x0, y0, x1, y1] = activeHighlight.bbox;
    return {
      position: 'absolute',
      left: `${x0 * scale}px`,
      top: `${y0 * scale}px`,
      width: `${(x1 - x0) * scale}px`,
      height: `${(y1 - y0) * scale}px`,
      backgroundColor: 'rgba(253, 224, 71, 0.4)', 
      border: '2px solid rgba(234, 179, 8, 0.8)',
      borderRadius: '4px',
      pointerEvents: 'none',
      zIndex: 50,
      boxShadow: '0 0 10px rgba(234, 179, 8, 0.5)'
    };
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]" ref={containerRef}>
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 shrink-0 shadow-sm z-10">
        <div className="flex gap-2">
          <button 
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 hover:bg-gray-50 rounded-md disabled:opacity-50 font-bold text-gray-700 transition-colors"
          >
            Prev
          </button>
          <button 
            onClick={() => setPageNumber(p => Math.min(numPages || p, p + 1))}
            disabled={pageNumber >= numPages}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 hover:bg-gray-50 rounded-md disabled:opacity-50 font-bold text-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
        
        <span className="text-sm font-semibold text-gray-700">
          Page {pageNumber} of {numPages || '--'}
        </span>
        
        <div className="flex gap-2 items-center">
          <button onClick={handleZoomOut} className="w-8 h-8 flex items-center justify-center text-lg bg-white border border-gray-300 hover:bg-gray-50 rounded-md font-bold text-gray-700 transition-colors">-</button>
          <span className="text-xs font-semibold text-gray-500 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn} className="w-8 h-8 flex items-center justify-center text-lg bg-white border border-gray-300 hover:bg-gray-50 rounded-md font-bold text-gray-700 transition-colors">+</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex justify-center bg-gray-50/50">
        <Document 
          file={pdfUrl} 
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="animate-pulse w-full h-[800px] bg-gray-200 rounded-lg" />}
          className="shadow-xl rounded-lg overflow-hidden border border-gray-200 bg-white"
        >
          <div className="relative">
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              onLoadSuccess={onPageLoadSuccess}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
            {activeHighlight && <div style={getHighlightStyle()} className="transition-all duration-300 ease-in-out" />}
          </div>
        </Document>
      </div>
    </div>
  );
}
