let img;
let asciiChar = "@%#*+=-:. ";

async function setup() {
  createCanvas(windowWidth, windowHeight);
  img = await loadImage("olho brilho.jpg");
  noLoop();
  describe("The image converted into ASCII art.");
}

function draw() {
  background(0);

  if (!img) return;

  const cellSize = 8;
  const squareSize = min(img.width, img.height);
  const sourceX = floor((img.width - squareSize) / 2);
  const sourceY = floor((img.height - squareSize) / 2);
  const windowAspect = width / height;
  const cropWidth = windowAspect > 1 ? squareSize : squareSize * windowAspect;
  const cropHeight = windowAspect > 1 ? squareSize / windowAspect : squareSize;
  const cropX = (squareSize - cropWidth) / 2;
  const cropY = (squareSize - cropHeight) / 2;
  const scaleFactor = width / cropWidth;

  textFont("monospace");
  textSize((cellSize + 2) * scaleFactor);
  textAlign(LEFT, TOP);

  for (let y = 0; y < cropHeight; y += cellSize) {
    for (let x = 0; x < cropWidth; x += cellSize) {
      const pixelVal = img.get(sourceX + floor(cropX + x), sourceY + floor(cropY + y));
      const normalizedBrightness = brightness(pixelVal) / 100;
      const adjustedBrightness = pow(normalizedBrightness, 1.4);
      const charIndex = floor(adjustedBrightness * (asciiChar.length - 1));
      const charToDraw = asciiChar.charAt(charIndex);

      fill(255, 45, 200);
      text(charToDraw, x * scaleFactor, y * scaleFactor);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}