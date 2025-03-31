
function initUpload() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const originalCanvas = document.getElementById('shadow-canvas');
    const originalCtx = originalCanvas.getContext('2d');
    const manipulatedCanvas = document.getElementById('shadow-canvas-manipulated');
    const manipulatedCtx = manipulatedCanvas.getContext('2d');
    const predictionTable = document.getElementById('first-prediction-table');
    const currencySelect = document.getElementById('currency-select');
    const totalValue = document.getElementById('total-value');
    const downloadBtn = document.getElementById('download-report');
    const webcamBtn = document.getElementById('webcam-btn');
    const webcamSection = document.getElementById('webcam-section');

    let videoStream = null;

    // Load all supported currencies
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
        .then(res => res.json())
        .then(data => {
            currencySelect.innerHTML = '';
            Object.keys(data.rates).forEach(cur => {
                const opt = document.createElement('option');
                opt.value = cur;
                opt.textContent = cur;
                currencySelect.appendChild(opt);
            });
        });

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', e => e.preventDefault());
    dropzone.addEventListener('drop', e => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    function handleFiles(files) {
        if (!files || !files[0]) return;
        const file = files[0];
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;
        img.onload = () => {
            originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
            originalCtx.drawImage(img, 0, 0, originalCanvas.width, originalCanvas.height);
            originalCanvas.style.opacity = '1';
            document.getElementById('canvas-section').style.display = 'flex';
        };
        uploadToBackend(file);
    }

    function uploadToBackend(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('target_currency', currencySelect.value);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }

            const annotatedImg = new Image();
            annotatedImg.src = 'data:image/jpeg;base64,' + data.image;
            annotatedImg.onload = () => {
                manipulatedCtx.clearRect(0, 0, manipulatedCanvas.width, manipulatedCanvas.height);
                manipulatedCtx.drawImage(annotatedImg, 0, 0, manipulatedCanvas.width, manipulatedCanvas.height);
                manipulatedCanvas.style.opacity = '1';
            };

            // Build the table
            predictionTable.innerHTML = '';
            if (data.table && data.table.length > 0) {
                const header = document.createElement('tr');
                header.innerHTML = `
                    <th>Label</th>
                    <th>Currency</th>
                    <th>Denomination</th>
                    <th>Count</th>
                    <th>Total</th>
                    <th>Thumbnail</th>
                `;
                predictionTable.appendChild(header);

                data.table.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${row.Label}</td>
                        <td>${row.Currency}</td>
                        <td>${row.Denomination}</td>
                        <td>${row.Count}</td>
                        <td>${row.Total}</td>
                        <td><img src="/static/uploads/${row.Thumbnail}" width="60"/></td>
                    `;
                    predictionTable.appendChild(tr);
                });

                const footer = document.createElement('tr');
                footer.innerHTML = `
                    <td colspan="4" style="text-align:right;"><strong>Final Total:</strong></td>
                    <td colspan="2"><strong>${data.converted_total.toFixed(2)} ${data.currency}</strong></td>
                `;
                predictionTable.appendChild(footer);

                totalValue.innerText = `${data.converted_total.toFixed(2)} ${data.currency}`;
            }

            if (data.report_url) {
                downloadBtn.style.display = 'inline-block';
                downloadBtn.href = data.report_url;
                downloadBtn.download = 'currency_report.pdf';
            }
        });
    }

    webcamBtn.addEventListener('click', () => {
        if (!webcamSection.querySelector('video')) {
            const video = document.createElement('video');
            video.autoplay = true;
            video.width = 400;
            video.height = 300;
            webcamSection.appendChild(video);

            const captureBtn = document.createElement('button');
            captureBtn.textContent = '📸 Capture & Predict';
            captureBtn.className = 'animated-button';
            webcamSection.appendChild(captureBtn);

            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    video.srcObject = stream;
                    videoStream = stream;

                    captureBtn.onclick = () => {
                        const hiddenCanvas = document.createElement('canvas');
                        hiddenCanvas.width = video.videoWidth;
                        hiddenCanvas.height = video.videoHeight;
                        const ctx = hiddenCanvas.getContext('2d');
                        ctx.drawImage(video, 0, 0);
                        hiddenCanvas.toBlob(blob => {
                            uploadToBackend(blob);
                        }, 'image/jpeg');

                        stream.getTracks().forEach(track => track.stop());
                        video.remove();
                        captureBtn.remove();
                    };
                })
                .catch(err => {
                    alert("Webcam access failed.");
                    console.error(err);
                });
        }
    });

    document.getElementById('clear-upload').addEventListener('click', () => {
        originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
        manipulatedCtx.clearRect(0, 0, manipulatedCanvas.width, manipulatedCanvas.height);
        predictionTable.innerHTML = '';
        totalValue.innerText = '';
        downloadBtn.style.display = 'none';
        document.getElementById('canvas-section').style.display = 'none';
    });
}

window.addEventListener('DOMContentLoaded', initUpload);
