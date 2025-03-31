function initCamera() {
    const canvas = document.getElementById('shadow-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D context');
        return;
    }

    const video = document.createElement('video');
    video.autoplay = true;
    let mediaStream = null;

    const startButton = document.createElement('button');
    startButton.textContent = 'Start Camera';
    document.querySelector('.simulator-grid').prepend(startButton);

    function draw() {
        if (mediaStream && video.readyState >= 2) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(draw);
        }
    }

    startButton.addEventListener('click', () => {
        if (!mediaStream) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    mediaStream = stream;
                    video.srcObject = stream;
                    video.play().then(() => {
                        startButton.textContent = 'Stop Camera';
                        draw();
                    });
                })
                .catch((error) => {
                    console.error('Camera error:', error);
                });
        } else {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
            video.srcObject = null;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            startButton.textContent = 'Start Camera';
        }
    });
}

initCamera();