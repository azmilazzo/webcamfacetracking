function init_evaluators() {
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