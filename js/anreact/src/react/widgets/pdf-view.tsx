
import React from 'react';
import { Comprops, CrudCompW } from '../crud';

export interface PdfViewProps {
    /** Path to Mozzila PDF.js release, undefined for the CDN version. */
    pdfjs?: string,

    /** Http GET to doc */
    src: string,
    close: (e: React.UIEvent) => void
}

// export interface PdfObject {
//   getPage: (p: number) => Promise<{ getViewport: (ref: { scale: number; }) => any;
//   render : (ctx: { canvasContext: any; viewport: any; }) => void; }>;
// }

/**
 */
export class PdfView extends CrudCompW<Comprops & PdfViewProps> {

  config = {
    iconSize: 5,
  };

  state = {
    currentPage: 0,
    // pdfRef: undefined,

    pageRendering: false,
    pageNumPending: -1,
  }

//   canvasRef: HTMLCanvasElement;
//   pdfjsLib: {
//       getDocument(src: string): unknown; GlobalWorkerOptions: { workerSrc: string } 
//   };

  constructor (props: PdfViewProps) {
    super(props);
  }

  componentDidMount() {
    // Create a script element
    const script = document.createElement('script');
    script.type = 'module';
    // script.src = 'pdf.mjs';
    // script.src = '//mozilla.github.io/pdf.js/build/pdf.mjs';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.min.mjs';
    script.async = true;

    // Run code after the script is loaded
    script.onload = () => {
        console.log('pdf.js loaded!');

        var url = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf';

        // Loaded via <script> tag, create shortcut to access PDF.js exports.
        let { pdfjsLib } = globalThis as any;
    
        // The workerSrc property shall be specified.
        // pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.mjs';
        pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.mjs';

        // Asynchronous download of PDF
        var loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then(function(pdf) {
        console.log('PDF loaded');
    
        // Fetch the first page
        let pageNumber = 1;
        pdf.getPage(pageNumber).then(function(page) {
            console.log('Page loaded');
    
            let scale = 1.5;
            let viewport = page.getViewport({scale: scale});
    
            // Prepare canvas using PDF page dimensions
            let canvas = document.getElementById('pdf') as HTMLCanvasElement;
            let context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
    
            // Render PDF page into canvas context
            let renderContext = {
            canvasContext: context,
            viewport: viewport
            };
            let renderTask = page.render(renderContext);
            renderTask.promise.then(function () {
            console.log('Page rendered');
            });
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

  /**
   * If another page rendering in progress, waits until the rendering is
   * finished. Otherwise, executes rendering immediately.
   */
  // queueRenderPage(num) {
  //   if (this.state.pageRendering) {
  //     this.setState({pageNumPending: num});
  //   } else {
  //     this.renderPage(this.state.pdfRef, this.canvasRef, num);
  //   }
  // }

  // prevpage() {
  //   if (this.state.currentPage <= 1)
  //     return;
  //   this.state.currentPage--;
  //   this.queueRenderPage(this.state.currentPage);
  // }

  // nextpage() {
  //     if (this.state.currentPage >= this.state.pdfRef.numPages)
  //       return;
  //     this.state.currentPage++;
  //     this.queueRenderPage(this.state.currentPage);

  // }

  // renderPage = (pdf: PdfObject, canvas: HTMLCanvasElement, pageNum: number) => {
  //   pdf.getPage(pageNum).then(
  //     (page: {
  //       getViewport: (arg0: { scale: number; }) => any;
  //       render: (arg0: { canvasContext: any; viewport: any; }) => void; }) => {
  //         let viewport = page.getViewport({scale: 1.00});

  //         const outputScale = window.devicePixelRatio || 1;
  //         canvas.width  = Math.floor(viewport.width * outputScale);
  //         canvas.height = Math.floor(viewport.height * outputScale);
  //         canvas.style.width  = Math.floor(viewport.width) + "px";
  //         canvas.style.height =  Math.floor(viewport.height) + "px";

  //         let transform = outputScale !== 1
  //               ? [outputScale, 0, 0, outputScale, 0, 0]
  //               : null;

  //         const renderContext = {
  //             canvasContext: canvas.getContext('2d'),
  //             viewport: viewport,
  //             transform
  //         };
  //         page.render(renderContext);
  //   } );
  // }

  render() {
    return (<div
    style={{
      top: '0px', left: '0px',
      overflow: 'hidden', position: 'fixed', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
      height: '100%', width: '100%',
      backgroundColor: 'rgba(0,0,0,1)'
    }}>
      {/* <script src={this.props.pdfjs || '//mozilla.github.io/pdf.js/build/pdf.mjs'}></script> */}
          {/* styles={{height: '100%', position: 'absolute', top: '0', width: '100%', left: '0'}} url={this.props.src}/> */}
      <canvas id="pdf"/>
      <div style={{
          background: '#cacaca77',
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
