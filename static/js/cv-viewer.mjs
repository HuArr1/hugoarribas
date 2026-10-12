const viewer = document.querySelector(".cv-viewer");

if (viewer) {
    const status = viewer.querySelector(".cv-viewer-status");
    status.hidden = false;
    try {
        const { getDocument, GlobalWorkerOptions } = await import(viewer.dataset.library);
        GlobalWorkerOptions.workerSrc = viewer.dataset.worker;
        const pdf = await getDocument({ url: viewer.dataset.pdf }).promise;
        const pages = viewer.querySelector(".cv-pages");

        for (let number = 1; number <= pdf.numPages; number++) {
            const page = await pdf.getPage(number);
            const viewport = page.getViewport({ scale: 2.5 });
            const figure = document.createElement("figure");
            figure.className = "cv-page";
            figure.setAttribute("role", "group");
            figure.setAttribute("aria-label", `Page ${number} of ${pdf.numPages}`);

            const canvas = document.createElement("canvas");
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            canvas.setAttribute("aria-hidden", "true");
            await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
            figure.append(canvas);

            const text = await page.getTextContent();
            const transcript = document.createElement("div");
            transcript.className = "cv-page-text";
            transcript.textContent = text.items
                .map(item => item.str + (item.hasEOL ? "\n" : " "))
                .join("");
            figure.append(transcript);
            pages.append(figure);
            page.cleanup();
        }

        status.remove();
    } catch (error) {
        status.textContent = "The CV could not be displayed. Please open it using the link below.";
        console.error("Could not display the CV:", error);
    }
}
