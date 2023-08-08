import * as pdfjsLib from "pdfjs-dist/build/pdf";
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import React from 'react';
import { Comprops, CrudCompW } from '../../../../src/react/crud';

export interface PdfViewerProps {
    src: string,
    close: (e: React.UIEvent) => void
}

export class PdfViewer extends CrudCompW<Comprops & PdfViewerProps> {

  config = {
    iconSize: 5,
  };

  state = {
    currentPage: 0,
    pdfRef: undefined
  }

  canvasRef: HTMLCanvasElement;

  constructor (props) {
    super(props);

    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  }

	componentDidMount() {
    const loadingTask = pdfjsLib.getDocument(this.props.src);

    let that = this;
    loadingTask.promise
      .then((pdf: ((prevState: pdfjsLib) => undefined)) => {
        pdf.getPage(1).then(
            function ( page: {
                getViewport: (arg0: { scale: number; }) => any;
                render: (arg0: { canvasContext: any; viewport: any; }) => void; }) {
        
                const viewport = page.getViewport({scale: 1.5});
                const canvas = that.canvasRef;
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const renderContext = {
                    canvasContext: canvas.getContext('2d'),
                    viewport: viewport
                };
                page.render(renderContext);
                } );
        that.setState({pdfRef: pdf});
      },
      function (reason) {
        console.error(reason);
      })
  }

  renderPage = (pageNum) => {
      let pdf=this.state.pdfRef;

      pdf && pdf.getPage(pageNum)
        .then( function ( page: {
          getViewport: (arg0: { scale: number; }) => any;
          render: (arg0: { canvasContext: any; viewport: any; }) => void; }) {

          const viewport = page.getViewport({scale: 1.5});
          const canvas = pdf.current;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const renderContext = {
              canvasContext: canvas.getContext('2d'),
              viewport: viewport
          };
          page.render(renderContext);
        });   
  };
 
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
    </div>);
  }
}