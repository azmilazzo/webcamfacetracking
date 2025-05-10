let isWebGLAvailable = true;

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = `ERROR: ${message} | Fix: Refresh, Use Chrome/Firefox, Enable WebGL`;
    errorDiv.style.display = 'block';
}

function start() {
    WebARRocksFaceDebugHelper.init({
        spec: {
            NNCPath: 'https://cdn.jsdelivr.net/gh/WebAR-rocks/WebAR.rocks.face@latest/neuralNets/NN_AUTOBONES_21.json',
            // Crucial camera configuration
            videoSettings: {
                facingMode: 'user',
                width: { min: 640, ideal: 1280 },
                height: { min: 480, ideal: 720 }
            }
        },
        callbackReady: (err, spec) => {
            if (err) {
                showError(`Initialization failed: ${err}`);
                isWebGLAvailable = false;
                return;
            }
            console.log('Camera feed active');
        },
        callbackTrack: (detectState) => {
            if (!isWebGLAvailable) return;
            
            // Your tracking logic here
            const canvas = document.getElementById('WebARRocksFaceCanvas');
            const ctx = canvas.getContext('2d');
            
            // Clear previous frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw nose indicator (example)
            if (detectState.landmarks) {
                const noseTip = detectState.landmarks.noseTip;
                const x = noseTip[0] * canvas.width;
                const y = noseTip[1] * canvas.height;
                
                ctx.beginPath();
                ctx.arc(x, y, 10, 0, Math.PI * 2);
                ctx.fillStyle = '#FF0000';
                ctx.fill();
            }
        },
        callbackError: (err) => {
            showError(`Camera error: ${err.message}`);
        }
    });
}

// Automatic resizer with safety checks
WebARRocksResizer.size_canvas({
    canvasId: 'WebARRocksFaceCanvas',
    callback: () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showError('Camera API not supported');
            return;
        }
        if (location.protocol !== 'https:' && !location.hostname.match(/localhost|127\.0\.0\.1/)) {
            showError('Camera requires HTTPS (except localhost)');
            return;
        }
        start();
    }
});
