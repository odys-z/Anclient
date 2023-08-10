import * as pdfjsLib from "pdfjs-dist/build/pdf";
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import React from 'react';
import { Comprops, CrudCompW } from '../crud';

export interface PdfViewerProps {
    src: string,
    close: (e: React.UIEvent) => void
}

export interface PdfObject {
  getPage: (p: number) => Promise<{ getViewport: (ref: { scale: number; }) => any;
  render : (ctx: { canvasContext: any; viewport: any; }) => void; }>;
}

/**
 * The dependency PDF.js required by @anclient/anreact is saved as develope. Users must install:
 * <pre>npm install pdfjs-dist</pre>
 * 
 * Experiment results (loading on mobile device is more expensive):
 *
 * https://cdn.jsdelivr.net/npm/pdfjs-dist@3.9.179/build/pdf.min.js  :  87.8 KB, 1.39s
 * 
 * https://cdn.jsdelivr.net/npm/pdfjs-dist@3.9.179/build/pdf.worker.js  :  391 KB, 2.03s
 * 
 * https://cdn.jsdelivr.net/npm/pdfjs-dist@3.9.179/web/pdf_viewer.min.css  :  5.4 KB, 972ms
 * 
 * local pdf: 1.4 M, 7ms 
 */
export class PdfViewer extends CrudCompW<Comprops & PdfViewerProps> {

  config = {
    iconSize: 5,
  };

  state = {
    currentPage: 0,
    pdfRef: undefined,

    pageRendering: false,
    pageNumPending: -1,
  }

  canvasRef: HTMLCanvasElement;

  constructor (props) {
    super(props);

    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  }

	componentDidMount() {
    let loadingTask = pdfjsLib.getDocument(this.props.src);

    let that = this;
    loadingTask.promise
      .then((pdf: PdfObject) => {
        this.renderPage(pdf, that.canvasRef, 1);
        that.setState({pdfRef: pdf, currentPage: 1});
      },
      function (reason) {
        console.error(reason);
      })
  }

  /**
   * If another page rendering in progress, waits until the rendering is
   * finished. Otherwise, executes rendering immediately.
   */
  queueRenderPage(num) {
    if (this.state.pageRendering) {
      this.setState({pageNumPending: num});
    } else {
      this.renderPage(this.state.pdfRef, this.canvasRef, num);
    }
  }

  prevpage() {
    if (this.state.currentPage <= 1) 
      return;
    this.state.currentPage--;
    this.queueRenderPage(this.state.currentPage);
  }

  nextpage() {
      if (this.state.currentPage >= this.state.pdfRef.numPages)
        return;
      this.state.currentPage++;
      this.queueRenderPage(this.state.currentPage);
  
  }

  renderPage = (pdf: PdfObject, canvas: HTMLCanvasElement, pageNum: number) => {
    pdf.getPage(pageNum).then(
      (page: {
        getViewport: (arg0: { scale: number; }) => any;
        render: (arg0: { canvasContext: any; viewport: any; }) => void; }) => {
          let viewport = page.getViewport({scale: 1.00});
          // let canvas = that.canvasRef;
          // canvas.height = viewport.height;
          // canvas.width = viewport.width;

          const outputScale = window.devicePixelRatio || 1;
          canvas.width  = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width  = Math.floor(viewport.width) + "px";
          canvas.style.height =  Math.floor(viewport.height) + "px";

          let transform = outputScale !== 1
                ? [outputScale, 0, 0, outputScale, 0, 0]
                : null;

          console.log(canvas.width, canvas.height, "scale 1.0", viewport.width, viewport.height, outputScale)
  
          const renderContext = {
              canvasContext: canvas.getContext('2d'),
              viewport: viewport,
              transform
          };
          page.render(renderContext);
    } );
  }

  render() {
    return (<div
    // onTouchStart={this.handleTouchStart}
    // onTouchMove={this.handleTouchMove}
    // onTouchEnd={() => close()}
    style={{
      top: '0px', left: '0px',
      overflow: 'hidden', position: 'fixed', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
      height: '100%', width: '100%',
      backgroundColor: 'rgba(0,0,0,1)'
    }}>
      <canvas style={{width: "90%", height: "90%"}} ref={(ref) => this.canvasRef = ref}></canvas>

      <div style={{
          position: 'absolute',
          top: '0px', right: '0px',
          padding: '10px', cursor: 'pointer',
          color: '#FFFFFF',
          fontSize: `${this.config.iconSize * 0.8}px`
        }}
        onClick={this.props.close}>
        <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 0 24 24" width="36px" fill="#FFFFFF">
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </div>
      <div
        style={{
          background: '#cacaca77',
          borderRadius: '8px',
          position: 'absolute', left: '0px',
          zIndex: 1, cursor: 'pointer',
          color: '#FFFFFF',
          fontSize: `${this.config.iconSize}px`
        }}
        onClick={() => { this.prevpage(); }}>
        <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 0 24 24" width="48px" fill="#FFFFFF">
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </div>
      <div
        style={{
          background: '#cacaca77',
          borderRadius: '8px',
          position: 'absolute',
          right: '0px', zIndex: 1,
          color: '#FFFFFF', cursor: 'pointer',
          fontSize: `${this.config.iconSize}px`
        }}
        onClick={() => { this.nextpage(); }}>
        <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 0 24 24" width="48px" fill="#FFFFFF">
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </div>
    </div>);
  }

}