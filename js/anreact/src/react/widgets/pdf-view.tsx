import React from 'react';
import { Comprops, CrudCompW } from '../crud';
import { CSSTransform } from '../../utils/css-transform';

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

export interface PdfViewProps {
    /** Path to Mozzila PDF.js release, undefined for the CDN version. */
    pdfjs?: string,

    /** Http GET to PDF doc. */
    src: string,
    close: (e: React.UIEvent) => void
}

/**
 */
export class PdfView extends CrudCompW<Comprops & PdfViewProps> {

  uiConfig = {
    iconSize: 5,
  };

  state = { }

  viewConfig = {
    currentPage: 0,

    canvas: undefined as HTMLCanvasElement,
    context: undefined,

    pdfdoc: undefined,
    page: undefined as PDFPageProxy,

    transform: undefined as CSSTransform
  }

  constructor (props: PdfViewProps) {
    super(props);

    this.renderPage.bind(this);
    this.hasprev.bind(this);
    this.prevpage.bind(this);
    this.hasnext.bind(this);
    this.nextpage.bind(this);
  }

  renderPage() {
    let cfg = this.viewConfig;
    console.log(`Rendering page ${cfg.currentPage}`);

    cfg.pdfdoc.getPage(cfg.currentPage + 1).then((page) => {
      cfg.page = page;

      let viewport = cfg.page.getViewport({scale: cfg.transform.scale0});

      cfg.canvas.height = viewport.height;
      cfg.canvas.width = viewport.width;

      let renderContext = {
        canvasContext: cfg.context,
        viewport
      };

      try {
        let renderTask = cfg.page.render(renderContext);
        let that = this;
        renderTask.promise.then(function () {
          that.setState({});
        });
      } catch (e) {
        // Too quick to rerender
        console.log(e);
      }
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

    let screen = document.getElementById('screen') as HTMLCanvasElement;
    let canvas = document.getElementById('pdf') as HTMLCanvasElement;
    let context = canvas.getContext('2d');

    this.viewConfig = {currentPage: 0, transform: new CSSTransform, canvas, context, pdfdoc: undefined, page: undefined};

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();

      // Re-render if scale deviates too far (e.g., every 0.5 step)
      if (this.viewConfig.transform.scaleBy(e) > 0.5) {
        that.viewConfig.transform.stepScale();
        that.renderPage();
      }

      canvas.style.transform = that.viewConfig.transform.transform();
    });

    canvas.addEventListener('touchend', (e) => {
      console.log('touchend', e.touches.length, e.touches)
      if (e.touches.length > 1)
        that.viewConfig.transform.pinchEnd(e.touches);
      else
        that.viewConfig.transform.end();

      canvas.style.transform = that.viewConfig.transform.transform();
    });

    canvas.addEventListener('touchstart', (e) => {
      console.log('touchstart', e.touches.length, e.touches[0])
      that.viewConfig.transform.start(e.touches[0]);

      if (e.touches.length > 1)
        that.viewConfig.transform.pinchBegin(e.touches);

      canvas.style.transform = that.viewConfig.transform.transform();
    });

    canvas.addEventListener('touchmove', (e) => {
      console.log('touchmove', e.touches.length)
      if (that.viewConfig.transform.pinchTo(e.touches) > 0.5) {
        that.viewConfig.transform.stepScale();
        that.renderPage();
      }
      that.viewConfig.transform.moveTo(e.touches[0]);
      canvas.style.transform = that.viewConfig.transform.transform();
    });

    canvas.addEventListener('mouseup', (e) => {
      that.viewConfig.transform.end();
      canvas.style.transform = that.viewConfig.transform.transform();
    });

    screen.addEventListener('mouseup', (e) => {
      that.viewConfig.transform.end();
    });

    canvas.addEventListener('mousedown', (e) => {
      that.viewConfig.transform.start(e);
    });

    canvas.addEventListener('mousemove', (e) => {
      let dxy = that.viewConfig.transform.moveTo(e);
      if (dxy > 0) {
        canvas.style.transform = that.viewConfig.transform.transform();
      }
    });

    canvas.addEventListener('dblclick', (e) => {
      that.viewConfig.transform.reset();
      canvas.style.transform = that.viewConfig.transform.transform();
      that.renderPage();
    })

    // Run code after the script is loaded
    script.onload = () => {
      console.log('pdf.mjs loaded!');

      // let url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf';
      // let url = pdflink; //'private/CDSFL.pdf'; 

      // Loaded via <script> tag, create shortcut to access PDF.js exports.
      let { pdfjsLib } = globalThis as any;
      console.log('pdfjsLib / globalThis', pdfjsLib, globalThis);
  
      // The workerSrc property shall be specified.
      console.log('loading worker source from CDN...');

      // works: pdfjsLib.GlobalWorkerOptions.workerSrc = 'http://192.168.0.201:8900/pdfjs-legacy/pdf.worker.mjs';
      // failed: pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-legacy/pdf.worker.mjs';
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs-legacy/pdf.worker.mjs';
      
      // works: pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.mjs';


      // Asynchronous download of PDF
      // let loadingTask: PDFDocumentLoadingTask = pdfjsLib.getDocument(pdflink) as PDFDocumentLoadingTask;
      let loadingTask: PDFDocumentLoadingTask = pdfjsLib.getDocument({url: pdflink,
        // fuck CCP
        // I  [INFO:CONSOLE(5529)] "Warning: loadFont - translateFont failed: "UnknownErrorException: Unable to load binary CMap at: https://cdn.jsdelivr.net/npm/pdfjs-dist@5.0.375/cmaps/UniGB-UCS2-H.bcmap".", source: /pdfjs-legacy/pdf.worker.mjs (5529)
        // cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.0.375/cmaps/'
        cMapUrl: '/pdfjs-legacy/cmaps/'
      }) as PDFDocumentLoadingTask;

      loadingTask.promise.then(function(pdf) {
        console.log('PDF loaded', pdf);
        
        that.viewConfig.pdfdoc = pdf;

        // Fetch the first page
        that.viewConfig.currentPage = 0;
        that.viewConfig.pdfdoc = pdf;
        that.renderPage();
        // pdf.getPage(pageNumber).then(function(page) {
        //   that.viewConfig.page = page;
        //   that.renderPage();
        // });

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

  hasprev() {
    return this.viewConfig.pdfdoc && this.viewConfig.pdfdoc.numPages > 0 && this.viewConfig.currentPage > 0;
  }

  prevpage() {
    if (!this.hasprev())
      return;

    this.viewConfig.currentPage--;
    this.renderPage();
  }

  hasnext() {
    return this.viewConfig.pdfdoc && this.viewConfig.pdfdoc.numPages > 0 && this.viewConfig.currentPage < this.viewConfig.pdfdoc.numPages - 1;
  }

  nextpage() {
    if (!this.hasnext())
      return;

    this.viewConfig.currentPage++;
    this.renderPage();
  }

  render() {
    return (<div id="screen"
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
      {this.hasprev() && <div
        style={{
          background: '#cacaca77',
          borderRadius: '8px',
          position: 'absolute', left: '0px',
          zIndex: 1, cursor: 'pointer',
          color: '#FFFFFF',
          fontSize: `${this.uiConfig.iconSize}px`
        }}
        onClick={() => { this.prevpage(); }}>
        <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 0 24 24" width="48px" fill="#FFFFFF">
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </div>}
      {this.hasnext() && <div
        style={{
          background: '#cacaca77',
          borderRadius: '8px',
          position: 'absolute',
          right: '0px', zIndex: 1,
          color: '#FFFFFF', cursor: 'pointer',
          fontSize: `${this.uiConfig.iconSize}px`
        }}
        onClick={() => { this.nextpage(); }}>
        <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 0 24 24" width="48px" fill="#FFFFFF">
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </div>}
    </div>);
  }

}
