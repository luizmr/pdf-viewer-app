let url = "../docs/pdf.pdf";

let pdfDoc = null,
	pageNum = 1,
	pageIsRendering = false,
	pageNumIsPending = null;

let scale = 1.5;
const canvas = document.querySelector("#pdf-render");
const ctx = canvas.getContext("2d");

// render the page

const renderPage = (num) => {
	pageIsRendering = true;

	// get the page
	pdfDoc.getPage(num).then((page) => {
		console.log(page);
		// set scale
		const viewport = page.getViewport({ scale });
		canvas.height = viewport.height;
		canvas.width = viewport.width;

		const renderCtx = { canvasContext: ctx, viewport };
		page.render(renderCtx).promise.then(() => {
			pageIsRendering = false;

			if (pageNumIsPending !== null) {
				renderPage(pageNumIsPending);
				pageNumIsPending = null;
			}
		});

		// output current page
		const pageNum = document.querySelector("#page-num");
		if (pageNum) {
			pageNum.textContent = num;
		}
	});
};

// check for pages rendering

const queueRenderPage = (num) => {
	if (pageIsRendering) {
		pageNumIsPending = num;
	} else {
		renderPage(num);
	}
};

// show prev page

const showPrevPage = () => {
	if (pageNum <= 1) {
		return;
	}
	pageNum--;
	queueRenderPage(pageNum);
};

// show next page

const showNextPage = () => {
	if (pageNum >= pdfDoc.numPages) {
		return;
	}
	pageNum++;
	queueRenderPage(pageNum);
};

// get document - methods from pdf.js lib

pdfjsLib
	.getDocument(url)
	.promise.then((pdfDoc_) => {
		pdfDoc = pdfDoc_;
		console.log(pdfDoc);

		document.querySelector("#page-count").textContent = pdfDoc.numPages;

		renderPage(pageNum);
	})
	.catch((err) => {
		// display error
		const div = document.createElement("div");

		div.className = "error";
		div.appendChild(document.createTextNode(err.message));

		document.querySelector("body").insertBefore(div, canvas);

		// remove top bar

		document.querySelector(".top-bar").style.display = "none";
	});

// button events

document.querySelector("#prev-page").addEventListener("click", showPrevPage);
document.querySelector("#next-page").addEventListener("click", showNextPage);

document.querySelector(".minus").addEventListener("click", () => {
	if (scale >= 1) {
		scale = scale - 0.5;
		console.log(scale);
		renderPage(pageNum);
	}
});

document.querySelector(".plus").addEventListener("click", () => {
	if (scale <= 5) {
		scale = scale + 0.5;
		console.log(scale);
		renderPage(pageNum);
	}
});

const newUrl = document.querySelector(".url");

newUrl.addEventListener("change", (e) => {
	url = e.target.files[0];
	console.log(url);
	if (url.type == "application/pdf") {
		var fileReader = new FileReader();
		console.log(fileReader);
		fileReader.onload = function () {
			var pdfData = new Uint8Array(this.result);
			// Using DocumentInitParameters object to load binary data.
			var loadingTask = pdfjsLib.getDocument({ data: pdfData });
			loadingTask.promise
				.then((pdfDoc_) => {
					pdfDoc = pdfDoc_;
					console.log(pdfDoc);

					document.querySelector("#page-count").textContent =
						pdfDoc.numPages;

					renderPage(pageNum);
				})
				.catch((err) => {
					// display error
					const div = document.createElement("div");

					div.className = "error";
					div.appendChild(document.createTextNode(err.message));

					document.querySelector("body").insertBefore(div, canvas);

					// remove top bar

					document.querySelector(".top-bar").style.display = "none";
				});
		};
		fileReader.readAsArrayBuffer(url);
	}
});
