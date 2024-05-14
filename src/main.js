import * as handTrack from "handtrackjs";
import { flapBird } from "./game";

const video = document.querySelector("video#WEBCAM");
const canvas = document.querySelector("canvas#WEBCAM");
handTrack.startVideo(video);
const context = canvas.getContext("2d");

const modelParams = {
  flipHorizontal: true, // flip e.g for video
  maxNumBoxes: 6, // maximum number of boxes to detect
  iouThreshold: 0.5, // ioU threshold for non-max suppression
  scoreThreshold: 0.4, // confidence threshold for predictions.
  flipHorizontal: true,
};

window.handState = "open";

video.addEventListener("loadeddata", async function () {
  const start = Date.now();
  const model = await handTrack.load(modelParams);
  console.log("Model loaded in: ", Date.now() - start, "ms");

  function detectHand() {
    model.detect(video).then((predictions) => {
      model.renderPredictions(predictions, canvas, context, video);

      const hands = predictions.filter((prediction) =>
        ["open", "closed", "pinch"].includes(prediction.label)
      );

      if (hands.length === 0) {
        window.handState = "open";
        return requestAnimationFrame(detectHand);
      }

      const recent = hands[0].label;
      const action = ["open", "closed"].includes(recent) ? recent : "closed";

      if (window.handState === "open" && action === "closed") {
        flapBird();
      }

      window.handState = action;

      requestAnimationFrame(detectHand);
    });
  }

  detectHand();
});
