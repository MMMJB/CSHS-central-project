const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const img = new Image();
img.src = "/spritesheet.png";

const width = window.innerWidth;
const height = window.innerHeight - 70;
canvas.width = width;
canvas.height = height;

// general settings
let gamePlaying = false;
const gravity = 0.5;
const speed = 6.2;
const size = [51, 36];
const jump = -11.5;
const cTenth = width / 10;

let index = 0,
  bestScore = 0,
  flight,
  flyHeight,
  currentScore,
  pipes = [];

// pipe settings
const pipeWidth = 78;
const pipeGap = 300;
const pipeSpacingMultiplier = 2;
const minPipeHeight = height / 6;
const maxPipeHeight = height / 1.2;
const pipeLoc = () =>
  (
    Math.random() * (height - (pipeGap + pipeWidth) - pipeWidth) +
    pipeWidth
  ).clamp(minPipeHeight, maxPipeHeight);

const setup = () => {
  currentScore = 0;
  flight = jump;
  window.handState = "open";

  // set initial flyHeight (middle of screen - size of the bird)
  flyHeight = height / 2 - size[1] / 2;

  // setup first 3 pipes
  pipes = Array(8)
    .fill()
    .map((a, i) => [
      width + i * (pipeGap + pipeWidth * pipeSpacingMultiplier),
      pipeLoc(),
    ]);
};

const render = () => {
  // make the pipe and bird moving
  index++;

  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i <= Math.ceil(width / 864); i++) {
    ctx.drawImage(
      img,
      589,
      0,
      864,
      768,
      -((index * (speed / 2)) % 864) + 864 * i,
      0,
      866,
      height
    );
  }

  // pipe display
  if (gamePlaying) {
    pipes.map((pipe) => {
      // pipe moving
      pipe[0] -= speed;

      // top pipe
      ctx.drawImage(
        img,
        432,
        588 - pipe[1],
        pipeWidth,
        pipe[1],
        pipe[0],
        0,
        pipeWidth,
        pipe[1]
      );
      // bottom pipe
      ctx.drawImage(
        img,
        432 + pipeWidth,
        108,
        pipeWidth,
        canvas.height - pipe[1] + pipeGap,
        pipe[0],
        pipe[1] + pipeGap,
        pipeWidth,
        canvas.height - pipe[1] + pipeGap
      );

      // give 1 point & create new pipe
      if (pipe[0] <= -pipeWidth) {
        currentScore++;
        // check if it's the best score
        bestScore = Math.max(bestScore, currentScore);

        // remove & create new pipe
        pipes = [
          ...pipes.slice(1),
          [
            pipes[pipes.length - 1][0] +
              pipeGap +
              pipeWidth * pipeSpacingMultiplier,
            pipeLoc(),
          ],
        ];
      }

      // if hit the pipe, end
      if (
        [
          pipe[0] <= cTenth + size[0],
          pipe[0] + pipeWidth >= cTenth,
          pipe[1] > flyHeight || pipe[1] + pipeGap < flyHeight + size[1],
        ].every((elem) => elem)
      ) {
        gamePlaying = false;
        setup();
      }
    });
  }
  // draw bird
  if (gamePlaying) {
    ctx.drawImage(
      img,
      432,
      Math.floor((index % 9) / 3) * size[1],
      ...size,
      cTenth,
      flyHeight,
      ...size
    );
    flight += gravity;
    flyHeight = Math.min(flyHeight + flight, height - size[1]);
  } else {
    ctx.drawImage(
      img,
      432,
      Math.floor((index % 9) / 3) * size[1],
      ...size,
      width / 2 - size[0] / 2,
      flyHeight,
      ...size
    );
    flyHeight = height / 2 - size[1] / 2;
    // text accueil
    ctx.textAlign = "center";
    ctx.fillText(`Best score : ${bestScore}`, width / 2, 245);
    ctx.fillText("Click to play", width / 2, 535);
    ctx.font = "bold 30px courier";
  }

  // document.getElementById("bestScore").innerHTML = `Best : ${bestScore}`;
  document.getElementById("currentScore").innerHTML = gamePlaying
    ? currentScore
    : "";

  // tell the browser to perform anim
  window.requestAnimationFrame(render);
};

// launch setup
setup();
img.onload = render;

const startGame = () => (gamePlaying = true);

document.addEventListener("click", startGame);
document.addEventListener("keydown", (e) => e.key === " " && startGame());

export function flapBird() {
  if (gamePlaying) flight = jump;
}
// window.onclick = () => flight = jump;
