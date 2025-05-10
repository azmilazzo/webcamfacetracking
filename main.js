let isWebGLAvailable = true;

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = `ERROR: ${message} | Fix: Refresh, Use Chrome/Firefox, Enable WebGL`;
    errorDiv.style.display = 'block';function init_evaluators() {
  // Define expressions with increased sensitivity
  WebARRocksFaceExpressionsEvaluator.add_expressionEvaluator('OPEN_MOUTH', {
    refLandmarks: ["lowerLipBot", "chin"],
    landmarks: ["lowerLipBot", "upperLipTop"],
    range: [0.7, 1.2], // Adjusted for more sensitivity
    isInv: false,
    isDebug: true
  });

  // Add more expressions with adjusted ranges as needed...
}

function init_triggers() {
  WebARRocksFaceExpressionsEvaluator.add_trigger('OPEN_MOUTH', {
    threshold: 0.4, // Lower threshold for higher sensitivity
    hysteresis: 0.05, // Smaller hysteresis to reduce delay
    onStart: function() {
      console.log('TRIGGER FIRED - MOUTH OPEN START');
    },
    onEnd: function() {
      console.log('TRIGGER FIRED - MOUTH OPEN END');
    }
  });

  // Add more triggers with adjusted thresholds as needed...
}

function start() {
  WebARRocksFaceDebugHelper.init({
    spec: {
      NNCPath: 'https://cdn.jsdelivr.net/gh/WebAR-rocks/WebAR.rocks.face@latest/neuralNets/NN_AUTOBONES_21.json'
    },
    callbackReady: function(err, spec) {
      if (err) {
        console.error('An error occurred:', err);
        return;
      }
      init_evaluators();
      init_triggers();
    },
    callbackTrack: function(detectState) {
      const expressionsValues = WebARRocksFaceExpressionsEvaluator.evaluate_expressions(detectState);
      WebARRocksFaceExpressionsEvaluator.run_triggers(expressionsValues);
    }
  })
}

function main() {
  WebARRocksResizer.size_canvas({
    canvasId: 'WebARRocksFaceCanvas',
    callback: start
  })
}

window.addEventListener('load', main);
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
