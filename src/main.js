import * as handTrack from 'handtrackjs';
import { flapBird } from './game';

const video = document.querySelector("video#WEBCAM");
const canvas = document.querySelector("canvas#WEBCAM");
handTrack.startVideo(video);
const context = canvas.getContext("2d");

const modelParams = {
  flipHorizontal: true, // flip e.g for video
  maxNumBoxes: 3, // maximum number of boxes to detect
  iouThreshold: 0.5, // ioU threshold for non-max suppression
  scoreThreshold: 0.6, // confidence threshold for predictions.
};

let state = "open";

video.addEventListener("loadeddata", async function() {
    const start = Date.now();
    const model =  await handTrack.load(modelParams);
    console.log("Model loaded in: ", Date.now() - start, "ms");

    function detectHand() {
         model.detect(video).then((predictions) => {
            model.renderPredictions(predictions, canvas, context, video);
            
            const hands = predictions.filter(prediction => prediction.label === "open" || prediction.label === "closed");
            if (hands.length === 0) {
              state = "open";
              return requestAnimationFrame(detectHand);
            }
            const action = predictions[0].label;

            if (state === "open" && action === "closed"){
              flapBird()
            }
            
            state = action;

            requestAnimationFrame(detectHand);
        });
    }

    detectHand();
})

