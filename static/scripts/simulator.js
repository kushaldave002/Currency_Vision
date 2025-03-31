let currentFile = null;
let isProcessing = false;

function initSimulator() {
    const originalCanvas = document.getElementById('shadow-canvas');
    const manipulatedCanvas = document.getElementById('shadow-canvas-manipulated');
    const originalCtx = originalCanvas.getContext('2d');
    const manipulatedCtx = manipulatedCanvas.getContext('2d');
    const overlay = document.getElementById('canvas-overlay');
    const controls = {
        preset: document.getElementById('preset-select'),
        process: document.getElementById('process-btn'),
        reset: document.getElementById('reset-btn'),
        save: document.getElementById('save-btn')
    };

    // Add error checking to prevent null errors
    if (!controls.preset || !controls.process || !controls.reset || !controls.save) {
        console.error('One or more control elements not found:', controls);
        return;
    }

    controls.preset.addEventListener('change', () => {
        if (isProcessing) renderManipulated(manipulatedCtx);
    });
    controls.process.addEventListener('click', () => {
        isProcessing = true;
        renderManipulated(manipulatedCtx);
    });
    controls.reset.addEventListener('click', () => resetCanvases());
    controls.save.addEventListener('click', () => saveCanvas(manipulatedCanvas));

    function renderOriginal(ctx) {
        if (!currentFile) return;
        ctx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
        loadToCanvas(currentFile, ctx, originalCanvas, true);
    }

    function renderManipulated(ctx) {
        if (!currentFile || !isProcessing) return;
        ctx.clearRect(0, 0, manipulatedCanvas.width, manipulatedCanvas.height);
        loadToCanvas(currentFile, ctx, manipulatedCanvas, false);
        const preset = controls.preset.value;
        let intensity = 0.5, softness = 5, angle = 45 * Math.PI / 180;
        if (preset === 'dramatic') {
            intensity = 0.9; softness = 2; angle = 90 * Math.PI / 180;
        } else if (preset === 'soft') {
            intensity = 0.3; softness = 15; angle = 0;
        }
        ctx.fillStyle = `rgba(0, 0, 0, ${intensity})`;
        ctx.filter = `blur(${softness}px)`;
        const offsetX = Math.cos(angle) * 50;
        const offsetY = Math.sin(angle) * 50;
        ctx.fillRect(manipulatedCanvas.width / 2 + offsetX - 50, manipulatedCanvas.height / 2 + offsetY, 100, 100);
    }
}

function loadToCanvas(file, ctx, canvas, isOriginal) {
    currentFile = file;
    const overlay = document.getElementById('canvas-overlay');

    const url = URL.createObjectURL(file);
    const media = file.type.startsWith('image') ? new Image() : document.createElement('video');
    media.src = url;
    media.onload = () => {
        ctx.drawImage(media, 0, 0, canvas.width, canvas.height);
        overlay.style.display = 'none';
        if (isOriginal) {
            renderOriginal(ctx);
        } else if (isProcessing) {
            renderManipulated(ctx);
        }
    };
    if (file.type.startsWith('video')) {
        media.onloadedmetadata = () => {
            media.play();
            function drawVideo() {
                ctx.drawImage(media, 0, 0, canvas.width, canvas.height);
                if (!isOriginal && isProcessing) {
                    renderManipulated(ctx);
                }
                requestAnimationFrame(drawVideo);
            }
            drawVideo();
        };
    }
}

function resetCanvases() {
    const originalCanvas = document.getElementById('shadow-canvas');
    const manipulatedCanvas = document.getElementById('shadow-canvas-manipulated');
    const originalCtx = originalCanvas.getContext('2d');
    const manipulatedCtx = manipulatedCanvas.getContext('2d');
    const overlay = document.getElementById('canvas-overlay');
    originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
    manipulatedCtx.clearRect(0, 0, manipulatedCanvas.width, manipulatedCanvas.height);
    overlay.style.display = 'flex';
    currentFile = null;
    isProcessing = false;
    document.getElementById('preset-select').value = 'default';
}

function applyPreset(controls, ctx) {
    if (isProcessing) renderManipulated(ctx);
}

function saveCanvas(canvas) {
    const link = document.createElement('a');
    link.download = 'shadowverse-scene.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}
document.addEventListener("DOMContentLoaded", function () {
    const manipulatedCanvas = document.getElementById("shadow-canvas-manipulated");
    const downloadBtnContainer = document.getElementById("download-btn-container");
    const downloadBtn = document.getElementById("download-btn");

    function checkIfCanvasHasImage() {
        const ctx = manipulatedCanvas.getContext("2d");
        if (!ctx) return false;

        // Check if the canvas has non-transparent pixels
        const imgData = ctx.getImageData(0, 0, manipulatedCanvas.width, manipulatedCanvas.height);
        return imgData.data.some(channel => channel !== 0);
    }

    function showDownloadButton() {
        if (checkIfCanvasHasImage()) {
            downloadBtnContainer.style.display = "block"; // Show button
        } else {
            downloadBtnContainer.style.display = "none"; // Hide button
        }
    }

    function drawImageOnManipulatedCanvas(imageSrc) {
        const ctx = manipulatedCanvas.getContext("2d");
        const img = new Image();
        img.onload = function () {
            ctx.clearRect(0, 0, manipulatedCanvas.width, manipulatedCanvas.height); // Clear previous image
            ctx.drawImage(img, 0, 0, manipulatedCanvas.width, manipulatedCanvas.height);
            showDownloadButton(); // Check and show button after drawing
        };
        img.src = imageSrc;
    }

    // Simulate an image being added (Replace with actual logic)
    document.getElementById("upload-btn").addEventListener("click", function () {
        drawImageOnManipulatedCanvas("your-image-path.png"); // Replace with actual image
    });

    // Download button functionality
    downloadBtn.addEventListener("click", function () {
        const image = manipulatedCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "manipulated-shadow.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Periodically check if an image exists in the manipulated canvas
    setInterval(showDownloadButton, 500);
});
