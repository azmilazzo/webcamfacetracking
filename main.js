function init_evaluators() {
    // Mouth open detection
    WebARRocksFaceExpressionsEvaluator.add_expressionEvaluator('OPEN_MOUTH', {
        refLandmarks: ["lowerLipBot", "chin"],
        landmarks: ["lowerLipBot", "upperLipTop"],
        range: [0.7, 1.2],
        isInv: false,
        isDebug: true
    });

    // Add more expressions here if needed
}

function init_triggers() {
    WebARRocksFaceExpressionsEvaluator.add_trigger('OPEN_MOUTH', {
        threshold: 0.4,
        hysteresis: 0.05,
        onStart: function() {
            console.log('MOUTH OPENED');
        },
        onEnd: function() {
            console.log('MOUTH CLOSED');
        }
    });

    // Add more triggers here if needed
}

function start() {
    const canvas = document.getElementById('WebARRocksFaceCanvas');
    const ctx = canvas.getContext('2d');
    
    WebARRocksFaceDebugHelper.init({
        spec: {
            NNCPath: 'https://cdn.jsdelivr.net/gh/WebAR-rocks/WebAR.rocks.face@latest/neuralNets/NN_AUTOBONES_21.json',
            maxFacesDetected: 1,
            stabilization: true
        },
        callbackReady: function(err, spec) {
            if (err) {
                console.error('Init Error:', err);
                return;
            }
            init_evaluators();
            init_triggers();
        },
        callbackTrack: function(detectState) {
            // Clear previous frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Process facial expressions
            const expressionsValues = WebARRocksFaceExpressionsEvaluator.evaluate_expressions(detectState);
            WebARRocksFaceExpressionsEvaluator.run_triggers(expressionsValues);

            // Nose position detection
            if (detectState.landmarks) {
                // Get nose tip coordinates (normalized 0-1)
                const noseTip = detectState.landmarks.noseTip;
                
                // Convert to canvas coordinates
                const x = noseTip[0] * canvas.width;
                const y = noseTip[1] * canvas.height;
                
                // Draw nose position indicator
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#ff0000';
                ctx.fill();
                
                // Optional: Log coordinates
                console.log(`Nose Position - X: ${x.toFixed(1)}, Y: ${y.toFixed(1)}`);
            }
        }
    });
}

function main() {
    WebARRocksResizer.size_canvas({
        canvasId: 'WebARRocksFaceCanvas',
        callback: start
    });
}

window.addEventListener('load', main);