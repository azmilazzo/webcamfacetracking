// WebGL Compatibility Check
function checkWebGL() {
    try {
        const canvas = document.createElement('canvas');
        return !!window.WebGLRenderingContext && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch(e) {
        return false;
    }
}

// Error Handling
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'block';
    errorDiv.innerHTML = `
        <h2>⚠️ Error: ${message}</h2>
        <p>Troubleshooting Steps:</p>
        <ol>
            <li>Refresh the page</li>
            <li>Enable WebGL in browser settings</li>
            <li>Update graphics drivers</li>
            <li>Try Chrome/Firefox</li>
            <li>Check camera permissions</li>
        </ol>
    `;
}

function init_evaluators() {
    WebARRocksFaceExpressionsEvaluator.add_expressionEvaluator('OPEN_MOUTH', {
        refLandmarks: ["lowerLipBot", "chin"],
        landmarks: ["lowerLipBot", "upperLipTop"],
        range: [0.7, 1.2],
        isInv: false,
        isDebug: true
    });
}

function init_triggers() {
    WebARRocksFaceExpressionsEvaluator.add_trigger('OPEN_MOUTH', {
        threshold: 0.4,
        hysteresis: 0.05,
        onStart: () => console.log('MOUTH OPEN'),
        onEnd: () => console.log('MOUTH CLOSED')
    });
}

async function startCamera() {
    if (!checkWebGL()) {
        showError('WebGL not supported!');
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            } 
        });
        document.getElementById('WebARRocksFaceCanvas').style.background = `url(${stream})`;
    } catch(error) {
        showError('Camera access denied!');
        return;
    }

    WebARRocksFaceDebugHelper.init({
        spec: {
            NNCPath: 'https://cdn.jsdelivr.net/gh/WebAR-rocks/WebAR.rocks.face@latest/neuralNets/NN_AUTOBONES_21.json',
            glOptions: { preserveDrawingBuffer: true },
            maxFacesDetected: 1,
            stabilization: true
        },
        callbackReady: (err, spec) => {
            if (err) {
                showError(`WebGL Error: ${err}`);
                return;
            }
            init_evaluators();
            init_triggers();
        },
        callbackTrack: (detectState) => {
            const ctx = document.getElementById('WebARRocksFaceCanvas').getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Nose tracking logic here
        }
    });
}

function main() {
    if (location.protocol !== 'https:' && !location.hostname.match(/localhost|127.0.0.1/)) {
        showError('Requires HTTPS connection!');
        return;
    }

    WebARRocksResizer.size_canvas({
        canvasId: 'WebARRocksFaceCanvas',
        callback: startCamera
    });
}

window.addEventListener('load', main);
