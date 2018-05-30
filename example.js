// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
//var url = 'https://dlcs.io/file/wellcome/1/caf18956-8f79-4fe6-8988-af329b036416';
var url = 'example.pdf';

// The workerSrc property shall be specified.
//PDFJS.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

var _pdfDoc = null;
var _pageNum = 1;
var _pageRendering = false;
var _pageNumPending = null;
var _defaultScale = 0.8;
var _scale = _defaultScale;
var _canvas = document.getElementById('the-canvas');
var _ctx = _canvas.getContext('2d');

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num, scale) {
  _pageRendering = true;
  // Using promise to fetch the page
  _pdfDoc.getPage(num).then(function(page) {
    var viewport = page.getViewport(scale);
    _canvas.height = viewport.height;
    _canvas.width = viewport.width;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: _ctx,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);

    // Wait for rendering to finish
    renderTask.promise.then(function() {
      _pageRendering = false;
      if (_pageNumPending !== null) {
        // New page rendering is pending
        renderPage(_pageNumPending);
        _pageNumPending = null;
      }
    });
  });

  // Update page counters
  document.getElementById('page_num').textContent = _pageNum;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
  if (_pageRendering) {
    _pageNumPending = num;
  } else {
    renderPage(num, _scale);
  }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
  if (_pageNum <= 1) {
    return;
  }
  _pageNum--;
  queueRenderPage(_pageNum);
}

document.getElementById('prev').addEventListener('click', onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
  if (_pageNum >= _pdfDoc.numPages) {
    return;
  }
  _pageNum++;
  queueRenderPage(_pageNum);
}

document.getElementById('next').addEventListener('click', onNextPage);

/**
 * Zooms in
 */
function onZoomIn() {
  _scale += 0.5;
  queueRenderPage(_pageNum);
}

document.getElementById('zoomin').addEventListener('click', onZoomIn);

/**
 * Zooms out
 */
function onZoomOut() {
  if (_scale > _defaultScale) {
    _scale -= 0.5;
    queueRenderPage(_pageNum);
  }
}

document.getElementById('zoomout').addEventListener('click', onZoomOut);


function rotate(delta) {
  if (!this.pdfDocument) {
    return;
  }
  let newRotation = (this.pdfViewer.pagesRotation + 360 + delta) % 360;
  this.pdfViewer.pagesRotation = newRotation;
  // Note that the thumbnail viewer is updated, and rendering is triggered,
  // in the 'rotationchanging' event handler.
}
