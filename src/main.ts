import startCamera from "./camera";
import { loadModel, estimatePoses } from "./detection";

// startCamera();

// const video = document.querySelector("video#WEBCAM") as HTMLVideoElement;
const image = document.querySelector("img#IMAGE") as HTMLImageElement;

(async function () {
  await loadModel();

  // video.addEventListener("loadeddata", async () => {
  //   const poses = await estimatePose(video);
  //   console.log(poses);
  // });
  const poses = await estimatePoses(image);
  console.log(poses);
})();
