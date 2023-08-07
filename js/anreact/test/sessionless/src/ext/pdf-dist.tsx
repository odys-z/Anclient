
import { useEffect, useState, useRef, useCallback } from 'react';
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import React from 'react';

export default function PdfViewer({url}){
  const canvasRef = useRef();
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  const [pdfRef, setPdfRef] = useState();
  const [currentPage, setCurrentPage] = useState(1);

  const renderPage = useCallback((pageNum, pdf=pdfRef) => {
    pdf && pdf.getPage(pageNum).then(function( page: {
		getViewport: (arg0: { scale: number; }) => any;
		render: (arg0: { canvasContext: any; viewport: any; }) => void; }) {

      const viewport = page.getViewport({scale: 1.5});
      const canvas = canvasRef.current;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      };
      page.render(renderContext);
    });   
  }, [pdfRef]);

  useEffect(() => {
    renderPage(currentPage, pdfRef);
  }, [pdfRef, currentPage, renderPage]);

  useEffect(() => {
    const loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(loadedPdf => {
      setPdfRef(loadedPdf);
    }, function (reason) {
      console.error(reason);
    });
  }, [url]);

  const nextPage = () => pdfRef && currentPage < pdfRef.numPages && setCurrentPage(currentPage + 1);

  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return <canvas ref={canvasRef}></canvas>;
}