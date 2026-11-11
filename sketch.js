// INPUTS: imagem e interação com o rato
let img;

const IMAGE_PATH = "olho brilho.jpg";

// EXPRESSÃO VISUAL
// Pouca densidade nas sombras e muita densidade nas zonas claras.
const ASCII_CHARS = " .:-=+*#%@";
const CELL_SIZE = 8;
const INK = [255, 45, 200];
const MULTIPLY_AFTER_CLICKS = 5;
const INVERT_COLORS_AFTER_PHRASES = 250;
const MAX_PHRASE_COPIES = 256;
const RESET_PROMPT = "Do you love me?";

// GRELHAS E ORGANIZAÇÃO
let asciiGrid = [];
let layout;
let asciiLayer;
let phraseCopies = [{ text: "love me", x: 0.5, y: 0.5 }];
let nextPhrase = "love me not";
let didDragSincePress = false;
let clickCount = 0;
let draggedPhraseIndex = -1;
let phraseGrabOffsetX = 0;
let phraseGrabOffsetY = 0;
let resetPromptPressed = false;

async function setup() {
  createCanvas(windowWidth, windowHeight);

  textFont("monospace");
  noStroke();
  noLoop();

  describe(
    "Um olho representado por caracteres ASCII cor-de-rosa " +
    "sobre fundo preto. Clicar adiciona alternadamente love me " +
    "e love me not ao ecrã."
  );

  try {
    img = await loadImage(IMAGE_PATH);
    buildGrids();
  } catch (error) {
    console.error("Não foi possível carregar a imagem:", error);
  }

  redraw();
}

function draw() {
  const colorsInverted = phraseCopies.length >= INVERT_COLORS_AFTER_PHRASES;
  background(...(colorsInverted ? INK : [0, 0, 0]));

  if (!img || !layout) {
    fill(...(colorsInverted ? [0, 0, 0] : INK));
    textStyle(NORMAL);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("Não foi possível carregar a imagem.", width / 2, height / 2);
    return;
  }

  drawAscii();
  drawPhraseCopies();

  if (phraseCopies.length >= INVERT_COLORS_AFTER_PHRASES) {
    drawResetPrompt();
  }
}

function drawPhraseCopies() {
  push();
  textFont("monospace");
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  const fontSize = getPhraseFontSize();
  textSize(fontSize);
  const phraseWidths = {
    "love me": textWidth("love me"),
    "love me not": textWidth("love me not")
  };
  const halfHeight = (textAscent() + textDescent()) / 2;
  fill(...(phraseCopies.length >= INVERT_COLORS_AFTER_PHRASES
    ? [0, 0, 0]
    : INK));

  for (const copy of phraseCopies) {
    const phraseWidth = phraseWidths[copy.text];
    const { x, y } = getPhraseCenter(copy, phraseWidth, halfHeight);

    text(copy.text, x, y);
  }

  pop();
}

function getPhraseCenter(copy, phraseWidth, halfHeight) {
  return {
    x: constrain(
      copy.x * width,
      min(width / 2, phraseWidth / 2 + 8),
      max(width / 2, width - phraseWidth / 2 - 8)
    ),
    y: constrain(
      copy.y * height,
      min(height / 2, halfHeight + 8),
      max(height / 2, height - halfHeight - 8)
    )
  };
}

function getPhraseFontSize() {
  const fontSize = min(40, width * 0.08, height * 0.1);
  textSize(fontSize);

  const maxPhraseWidth = max(textWidth("love me"), textWidth("love me not"));
  const fitScale = min(1, max(1, width - 24) / maxPhraseWidth);
  return fontSize * fitScale;
}

function getPhraseAt(x, y) {
  push();
  textFont("monospace");
  textStyle(BOLD);
  textSize(getPhraseFontSize());
  const phraseWidths = {
    "love me": textWidth("love me"),
    "love me not": textWidth("love me not")
  };
  const halfHeight = (textAscent() + textDescent()) / 2;

  for (let i = phraseCopies.length - 1; i >= 0; i -= 1) {
    const copy = phraseCopies[i];
    const phraseWidth = phraseWidths[copy.text];
    const { x: centerX, y: centerY } = getPhraseCenter(
      copy,
      phraseWidth,
      halfHeight
    );

    if (
      x >= centerX - phraseWidth / 2 - 8 &&
      x <= centerX + phraseWidth / 2 + 8 &&
      y >= centerY - halfHeight - 8 &&
      y <= centerY + halfHeight + 8
    ) {
      pop();
      return i;
    }
  }

  pop();
  return -1;
}

function getResetPromptBounds() {
  push();
  textFont("monospace");
  textStyle(BOLD);

  const fontSize = min(36, width * 0.06, height * 0.08);
  textSize(fontSize);
  const fitScale = min(1, max(1, width - 48) / textWidth(RESET_PROMPT));
  textSize(fontSize * fitScale);

  const bounds = {
    x: width / 2,
    y: height / 2,
    width: textWidth(RESET_PROMPT) + 32,
    height: textAscent() + textDescent() + 24
  };

  pop();
  return bounds;
}

function drawResetPrompt() {
  const bounds = getResetPromptBounds();

  push();
  rectMode(CENTER);
  noStroke();
  fill(255);
  rect(bounds.x, bounds.y, bounds.width, bounds.height, 8);

  textFont("monospace");
  textStyle(BOLD);
  textSize(min(36, width * 0.06, height * 0.08));
  const fitScale = min(1, max(1, width - 48) / textWidth(RESET_PROMPT));
  textSize(min(36, width * 0.06, height * 0.08) * fitScale);
  textAlign(CENTER, CENTER);
  fill(0);
  text(RESET_PROMPT, bounds.x, bounds.y);
  pop();
}

function isResetPromptAt(x, y) {
  if (phraseCopies.length < INVERT_COLORS_AFTER_PHRASES) return false;

  const bounds = getResetPromptBounds();
  return (
    x >= bounds.x - bounds.width / 2 &&
    x <= bounds.x + bounds.width / 2 &&
    y >= bounds.y - bounds.height / 2 &&
    y <= bounds.y + bounds.height / 2
  );
}

// --------------------------------------------------
// CONSTRUÇÃO DAS GRELHAS
// --------------------------------------------------

function buildGrids() {
  // Recorta uma zona central com a proporção do canvas.
  const canvasAspect = width / height;
  const imageAspect = img.width / img.height;

  let cropWidth;
  let cropHeight;

  if (imageAspect > canvasAspect) {
    cropHeight = img.height;
    cropWidth = cropHeight * canvasAspect;
  } else {
    cropWidth = img.width;
    cropHeight = cropWidth / canvasAspect;
  }

  const cropX = (img.width - cropWidth) / 2;
  const cropY = (img.height - cropHeight) / 2;

  layout = { scale: width / cropWidth };

  asciiGrid = [];

  for (let y = 0; y < cropHeight; y += CELL_SIZE) {
    for (let x = 0; x < cropWidth; x += CELL_SIZE) {
      const sampleX = min(
        img.width - 1,
        floor(cropX + x + CELL_SIZE / 2)
      );

      const sampleY = min(
        img.height - 1,
        floor(cropY + y + CELL_SIZE / 2)
      );

      const pixel = img.get(sampleX, sampleY);

      // Conversão RGB para um valor de luminosidade entre 0 e 1.
      const light =
        (0.2126 * pixel[0] +
          0.7152 * pixel[1] +
          0.0722 * pixel[2]) / 255;

      const adjustedLight = pow(light, 1.4);

      const index = constrain(
        floor(adjustedLight * (ASCII_CHARS.length - 1)),
        0,
        ASCII_CHARS.length - 1
      );

      const char = ASCII_CHARS.charAt(index);

      // Não precisamos de animar ou desenhar espaços vazios.
      if (char === " ") continue;

      asciiGrid.push({ x, y, char });
    }
  }

  if (asciiLayer) asciiLayer.remove();
  asciiLayer = createGraphics(width, height);
  asciiLayer.textFont("monospace");
  asciiLayer.textStyle(NORMAL);
  asciiLayer.textSize(CELL_SIZE * layout.scale);
  asciiLayer.textAlign(LEFT, TOP);
  asciiLayer.noStroke();
  asciiLayer.fill(...INK);

  for (const cell of asciiGrid) {
    asciiLayer.text(
      cell.char,
      cell.x * layout.scale,
      cell.y * layout.scale
    );
  }
}

// --------------------------------------------------
// DESENHO
// --------------------------------------------------

function drawAscii() {
  if (phraseCopies.length >= INVERT_COLORS_AFTER_PHRASES) {
    push();
    tint(0);
    image(asciiLayer, 0, 0);
    pop();
    return;
  }

  image(asciiLayer, 0, 0);
}

function mouseClicked() {
  if (resetPromptPressed) {
    window.location.reload();
    return false;
  }

  if (draggedPhraseIndex >= 0) {
    draggedPhraseIndex = -1;
    return false;
  }

  if (didDragSincePress) return false;
  if (phraseCopies.length >= MAX_PHRASE_COPIES) return false;

  phraseCopies.push({
    text: nextPhrase,
    x: mouseX / width,
    y: mouseY / height
  });
  nextPhrase = nextPhrase === "love me" ? "love me not" : "love me";

  clickCount += 1;
  if (clickCount >= MULTIPLY_AFTER_CLICKS) {
    const copiesToMultiply = phraseCopies.slice();

    for (const copy of copiesToMultiply) {
      if (phraseCopies.length >= MAX_PHRASE_COPIES) break;

      phraseCopies.push({
        text: copy.text,
        x: random(),
        y: random()
      });
    }
  }

  redraw();
  return false;
}

function mousePressed() {
  didDragSincePress = false;
  resetPromptPressed = isResetPromptAt(mouseX, mouseY);
  if (resetPromptPressed) {
    draggedPhraseIndex = -1;
    return;
  }

  draggedPhraseIndex = getPhraseAt(mouseX, mouseY);

  if (draggedPhraseIndex < 0) return;

  push();
  textFont("monospace");
  textStyle(BOLD);
  textSize(getPhraseFontSize());

  const copy = phraseCopies[draggedPhraseIndex];
  const phraseWidth = textWidth(copy.text);
  const halfHeight = (textAscent() + textDescent()) / 2;
  const center = getPhraseCenter(copy, phraseWidth, halfHeight);
  phraseGrabOffsetX = mouseX - center.x;
  phraseGrabOffsetY = mouseY - center.y;

  pop();
}

function mouseDragged() {
  if (draggedPhraseIndex >= 0) {
    const copy = phraseCopies[draggedPhraseIndex];

    push();
    textFont("monospace");
    textStyle(BOLD);
    textSize(getPhraseFontSize());
    const halfWidth = textWidth(copy.text) / 2 + 8;
    const halfHeight = (textAscent() + textDescent()) / 2 + 8;
    pop();

    const centerX = constrain(
      mouseX - phraseGrabOffsetX,
      min(width / 2, halfWidth),
      max(width / 2, width - halfWidth)
    );
    const centerY = constrain(
      mouseY - phraseGrabOffsetY,
      min(height / 2, halfHeight),
      max(height / 2, height - halfHeight)
    );

    copy.x = centerX / width;
    copy.y = centerY / height;
    redraw();
    didDragSincePress = true;
    return false;
  }

  didDragSincePress = true;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  if (img) buildGrids();

  redraw();
}