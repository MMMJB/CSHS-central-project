import * as tf from "@tensorflow/tfjs";

import bodyParts from "./bodyParts.json";

declare global {
  interface Window {
    model: tf.GraphModel<any>;
  }
}

const modelOptions = {
  modelPath: "/model.json",
  weightsPath: "/model.bin",
  minConfidence: 0.2,
};

async function loadImage(
  element: HTMLVideoElement | HTMLImageElement,
  inputSize: number
) {
  const obj = tf.tidy(function () {
    const tensor = tf.browser.fromPixels(element);
    const t = tensor.expandDims(0);
    const resize = tf.image.resizeBilinear(t, [inputSize, inputSize]);
    const finalTensor = tf.cast(resize, "int32");

    const img = {
      finalTensor,
      inputShape: tensor.shape,
      modelShape: tensor.shape,
      size: tensor.size,
    };
    return img;
  });

  return obj;
}

async function processResults(
  res: tf.Tensor,
  img: {
    inputShape: [number, number, number];
    modelShape: [number, number, number];
    size: number;
  }
) {
  const data = res.arraySync() as number[][][];
  res.dispose();

  const people = [];

  for (let p = 0; p < data[0].length; p++) {
    const kpt = data[0][p];
    const score = kpt[51 + 4];

    if (score < modelOptions.minConfidence) continue;

    const parts = [];
    for (let i = 0; i < 17; i++) {
      const part = {
        id: i,
        label: bodyParts[i],
        score: kpt[3 * i + 2],
        xRaw: kpt[3 * i + 1],
        yRaw: kpt[3 * i + 0],
        x: Math.trunc(kpt[3 * i + 1] * img.inputShape[1]),
        y: Math.trunc(kpt[3 * i + 0] * img.inputShape[0]),
      };
      parts.push(part);
    }

    const boxRaw = [
      kpt[51 + 1],
      kpt[51 + 0],
      kpt[51 + 3] - kpt[51 + 1],
      kpt[51 + 2] - kpt[51 + 0],
    ];

    people.push({
      id: p,
      score,
      boxRaw,
      box: boxRaw.map((a) => Math.trunc(a * img.inputShape[1])),
      parts,
    });
  }

  return people;
}

export async function loadModel() {
  const start = Date.now();

  tf.enableProdMode();
  tf.ENV.set("DEBUG", false);
  await tf.setBackend("webgl");
  await tf.ready();

  await Promise.all([
    fetch(modelOptions.modelPath),
    fetch(modelOptions.weightsPath),
  ])
    .then((r) => {
      return Promise.all([r[0].json(), r[1].arrayBuffer()]);
    })
    .then((d) => {
      window.model = tf.loadGraphModelSync([d[0], d[1]]);
    });

  console.log(`Model loaded in ${Date.now() - start}ms`);
}

export async function estimatePoses(
  element: HTMLVideoElement | HTMLImageElement
) {
  if (!window.model) return null;

  // @ts-expect-error
  const inputSize = Object.values(window.model.modelSignature["inputs"])[0]
    .tensorShape.dim[2].size;
  const img = await loadImage(element, inputSize);

  const start = Date.now();

  const res = window.model.execute(img.finalTensor) as tf.Tensor;
  const results = await processResults(res, img);

  console.log(`Model predicted in ${Date.now() - start}ms`);

  console.log(results);
}
