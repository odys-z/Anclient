import React from 'react';
import { Comprops, CrudCompW } from '../crud';
import { GrabToPan } from '../../utils/grab_to_pan';

// Using legacy. To do: install types
interface PDFDocumentLoadingTask {
  promise: Promise<PDFDocumentProxy>;
}

interface PDFDocumentProxy {
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
}

interface PDFPageProxy {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (context: { canvasContext: CanvasRenderingContext2D; viewport: any }) => { promise: Promise<void> };
}

// export interface PdfObject {
//   getPage: (p: number) => Promise<{ getViewport: (ref: { scale: number; }) => any;
//   render : (ctx: { canvasContext: any; viewport: any; }) => void; }>;
// }

export interface PdfViewProps {
    /** Path to Mozzila PDF.js release, undefined for the CDN version. */
    pdfjs?: string,

    /** Http GET to doc */
    src: string,
    close: (e: React.UIEvent) => void
}

/**
 */
export class PdfView extends CrudCompW<Comprops & PdfViewProps> {

  uiConfig = {
    iconSize: 5,
  };

  state = {
    currentPage: 0,

    // pageRendering: false,
    pageNumPending: -1,
  }

  viewConfig = {
    currentPage: 0,

    scale: 1.0,
    touchDist: 0,

    // script: HTMLScriptElement;
    canvas: undefined as HTMLCanvasElement,
    context: undefined,

    pdfdoc: undefined,
    page: undefined as PDFPageProxy
  }


  constructor (props: PdfViewProps) {
    super(props);

    let canvas = document.getElementById('pdf') as HTMLCanvasElement;
    let context = canvas.getContext('2d');

    this.viewConfig = {currentPage: 0, scale: 1.0, touchDist: 0, canvas, context, pdfdoc: undefined, page: undefined};

    let that = this;
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();

      // updateZoom(scale);
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1; // Zoom out/in
      let scale = Math.max(0.1, Math.min(5, this.viewConfig.scale * zoomFactor)); // Clamp between 0.1 and 5
      canvas.style.transform = `scale(${scale / that.viewConfig.scale})`;
      // Re-render if scale deviates too far (e.g., every 0.5 step)
      if (Math.abs(scale - that.viewConfig.scale) > 0.5) {
        that.viewConfig.scale = scale;
      }

      that.renderpdf(that.viewConfig);
    });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        this.viewConfig.touchDist = Math.hypot(touch1.pageX - touch2.pageX, touch1.pageY - touch2.pageY);
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      let grab = new GrabToPan({element: canvas});
      grab.onMouseMove(e);
    });
  }

  renderpdf = (cfg: {
    currentPage: number;
    context: CanvasRenderingContext2D;
    page: PDFPageProxy;
    canvas: any;
  }) => {

    console.log('Page loaded');

    let scale = 1.0;
    let viewport = cfg.page.getViewport({scale: scale});

    // Prepare canvas using PDF page dimensions
    cfg.canvas.height = viewport.height;
    cfg.canvas.width = viewport.width;

    // Render PDF page into canvas context
    let renderContext = {
      canvasContext: cfg.context,
      viewport
    };

    let renderTask = cfg.page.render(renderContext);
      renderTask.promise.then(function () {
      console.log('Page rendered');
    });
  }

  componentDidMount() {
    let that = this;

    // Create a script element
    let script = document.createElement('script');
    script.type = 'module';
    script.src = 'pdfjs-legacy/pdf.mjs';
    // script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.min.mjs';

    script.async = true;

    let pdflink = this.props.src;

    // Run code after the script is loaded
    script.onload = () => {
      console.log('pdf.mjs loaded!');

      // let url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf';
      let url = pdflink; //'private/CDSFL.pdf'; 

      // Loaded via <script> tag, create shortcut to access PDF.js exports.
      let { pdfjsLib } = globalThis as any;
  
      // The workerSrc property shall be specified.
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-legacy/pdf.worker.mjs';
      // pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.mjs';


      // Asynchronous download of PDF
      let loadingTask: PDFDocumentLoadingTask = pdfjsLib.getDocument(url) as PDFDocumentLoadingTask;
      loadingTask.promise.then(function(pdf) {
        console.log('PDF loaded', pdf);
        
        that.viewConfig.pdfdoc = pdf;

        // Fetch the first page
        let pageNumber = 1;
        pdf.getPage(pageNumber).then(function(page) {
          that.viewConfig.page = page;
          that.renderpdf(that.viewConfig);
        });
        }, function (reason) {
          // PDF loading error
          console.error(reason);
        });
    };

    // Handle errors
    script.onerror = () => {
      console.error('Failed to load pdf.js');
    };

    // Append the script to the document
    document.body.appendChild(script);

    // Store the script element to remove it later if needed
    // this.script = script;
  }

  componentWillUnmount() {
    // Cleanup: remove the script when the component unmounts
    // if (this.script) {
    //   document.body.removeChild(this.script);
    // }
  }

  render() {
    return (<div
    style={{
      top: '0px', left: '0px',
      overflow: 'hidden', position: 'fixed', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
      height: '100%', width: '100%',
      backgroundColor: 'rgba(0,0,0,1)'
    }}>
      <canvas id="pdf"/>
      <div style={{
          background: '#cacaca77',
          position: 'absolute',
          top: '0px', right: '0px',
          padding: '10px', cursor: 'pointer',
          color: '#FFFFFF',
          fontSize: `${this.uiConfig.iconSize * 0.8}px`
        }}
        onClick={this.props.close}>
        <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 0 24 24" width="36px" fill="#FFFFFF">
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </div>
      {/* <div
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
      </div> */}
    </div>);
  }

}
