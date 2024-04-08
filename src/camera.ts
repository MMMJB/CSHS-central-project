export default function startCamera() {
  const elm = document.querySelector("video#WEBCAM") as HTMLVideoElement;

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      elm.srcObject = stream;
    })
    .catch((err) => {
      console.error(err);
    });
}
