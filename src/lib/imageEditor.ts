/**
 * Image Editor Utility
 * Handles drawing text, checkboxes, and signatures on form images
 */

// Position configuration for PIC form
export interface PICPositions {
  // Partner section
  partnerName: { x: number; y: number };
  email: { x: number; y: number };
  mobile: { x: number; y: number };
  localChurch: { x: number; y: number };
  // Recipient section
  missionerName: { x: number; y: number };
  amount: { x: number; y: number };
  nation: { x: number; y: number };
  travelDate: { x: number; y: number };
  sendingChurch: { x: number; y: number };
}

// Position configuration for SAF form
export interface SAFPositions {
  // Checkboxes for Question 0 (Unable to go)
  unableToGoTeamFund: { x: number; y: number };
  unableToGoGeneralFund: { x: number; y: number };
  // Checkboxes for Question 1 (Rerouted)
  reroutedRetain: { x: number; y: number };
  reroutedGeneralFund: { x: number; y: number };
  // Checkboxes for Question 2 (Canceled)
  canceledGeneralFund: { x: number; y: number };
  // Signature area
  signature: { x: number; y: number; width: number; height: number };
  partnerNameUnderSignature: { x: number; y: number };

  offset: { x: number; y: number };
}

// Default positions (to be adjusted via trial and error)
// These are relative positions (0-1) that will be scaled based on image dimensions
// All coordinates represent CENTER points of the elements (text, checkboxes, signature areas)
export const PIC_POSITIONS: PICPositions = {
  partnerName: { x: 0.215, y: 0.32 }, // 15% from left, 25% from top
  email: { x: 0.215, y: 0.485 },
  mobile: { x: 0.215, y: 0.645 },
  localChurch: { x: 0.215, y: 0.802 },

  missionerName: { x: 0.7, y: 0.32 },
  amount: { x: 0.69, y: 0.485 },
  nation: { x: 0.66, y: 0.645 },
  travelDate: { x: 0.9, y: 0.645 },
  sendingChurch: { x: 0.696, y: 0.802 },
};

// All coordinates represent CENTER points of the elements
// For signature: x, y represent the center of the signature area
export const SAF_POSITIONS: SAFPositions = {
  unableToGoTeamFund: { x: 0.04, y: 0.608 },
  unableToGoGeneralFund: { x: 0.04, y: 0.608 + 0.059 },

  reroutedRetain: { x: 0.357, y: 0.57 },
  reroutedGeneralFund: { x: 0.357, y: 0.63 },

  canceledGeneralFund: { x: 0.695, y: 0.572 },

  offset: { x: 0, y: -0.08 },
  signature: { x: 0.58, y: 0.71, width: 0.5, height: 0.2 },
  partnerNameUnderSignature: { x: 0.817, y: 0.875 },
};

// Text styling
export const TEXT_COLOR = "#154a8f"; // bc-1 color
const FONT_FAMILY = "Arial, Helvetica, sans-serif";
export const FONT_SIZE_PIC = 28; // Base font size for PIC
export const FONT_SIZE_SAF = 28; // Base font size for SAF

/**
 * Load an image from a URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Draw text on canvas with word wrapping
 * x, y are center coordinates
 */
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth?: number,
  fontSize: number = FONT_SIZE_PIC,
) {
  if (!text) return;

  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `${fontSize}px ${FONT_FAMILY}`;
  ctx.textBaseline = "top";

  if (!maxWidth) {
    // Measure text to center it
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize; // Approximate height for single line
    const drawX = x - textWidth / 2;
    const drawY = y - textHeight / 2;
    ctx.fillText(text, drawX, drawY);
    return;
  }

  // Simple word wrapping - calculate total dimensions first
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  // Calculate total text dimensions
  let maxLineWidth = 0;
  for (const line of lines) {
    const metrics = ctx.measureText(line);
    if (metrics.width > maxLineWidth) {
      maxLineWidth = metrics.width;
    }
  }
  const totalHeight = lines.length * fontSize * 1.2;
  const textWidth = maxLineWidth;
  const textHeight = totalHeight;

  // Calculate starting position (top-left) from center
  const startX = x - textWidth / 2;
  const startY = y - textHeight / 2;

  // Draw each line
  let lineY = startY;
  for (const lineText of lines) {
    ctx.fillText(lineText, startX, lineY);
    lineY += fontSize * 1.2; // Line height
  }
}

/**
 * Draw a checkbox using check.png image
 * x, y are center coordinates
 */
function drawCheckbox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  checked: boolean,
  checkImage: HTMLImageElement | null,
) {
  if (checked && checkImage) {
    const size = 24; // Increased check image size
    // Adjust to top-left from center
    const drawX = x - size / 2;
    const drawY = y - size / 2;
    ctx.drawImage(checkImage, drawX, drawY, size, size);
  }
}

/**
 * Thicken signature strokes by processing image data
 */
function thickenSignature(imageData: ImageData, thickness: number = 1): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const newData = new Uint8ClampedArray(data);

  // Create a dilation effect to thicken strokes
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];

      // If this pixel is part of the signature (has alpha)
      if (alpha > 0) {
        // Expand the stroke by drawing in neighboring pixels
        for (let dy = -thickness; dy <= thickness; dy++) {
          for (let dx = -thickness; dx <= thickness; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = (ny * width + nx) * 4;
              // Only update if the neighbor is transparent or less opaque
              if (newData[nIdx + 3] < alpha) {
                newData[nIdx] = data[idx]; // R
                newData[nIdx + 1] = data[idx + 1]; // G
                newData[nIdx + 2] = data[idx + 2]; // B
                newData[nIdx + 3] = alpha; // A
              }
            }
          }
        }
      }
    }
  }

  return new ImageData(newData, width, height);
}

/**
 * Draw signature on canvas with thickened strokes, maintaining aspect ratio
 * x, y are center coordinates of the signature area
 */
function drawSignature(
  ctx: CanvasRenderingContext2D,
  signatureDataUrl: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Get original image dimensions
      const originalWidth = img.width;
      const originalHeight = img.height;
      const originalAspectRatio = originalWidth / originalHeight;
      const targetAspectRatio = width / height;

      // Calculate scaled dimensions to fit within the area while maintaining aspect ratio
      let scaledWidth: number;
      let scaledHeight: number;
      let offsetX = 0;
      let offsetY = 0;

      if (originalAspectRatio > targetAspectRatio) {
        // Image is wider - fit to width
        scaledWidth = width;
        scaledHeight = width / originalAspectRatio;
        // Center vertically
        offsetY = (height - scaledHeight) / 2;
      } else {
        // Image is taller - fit to height
        scaledHeight = height;
        scaledWidth = height * originalAspectRatio;
        // Center horizontally
        offsetX = (width - scaledWidth) / 2;
      }

      // Create a temporary canvas to process the signature
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = Math.ceil(scaledWidth);
      tempCanvas.height = Math.ceil(scaledHeight);
      const tempCtx = tempCanvas.getContext("2d");

      if (!tempCtx) {
        reject(new Error("Could not get temporary canvas context"));
        return;
      }

      // Draw the signature to the temporary canvas at original aspect ratio
      tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

      // Get image data and thicken the strokes
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const thickenedData = thickenSignature(imageData, 1);

      // Put the thickened image data back
      tempCtx.putImageData(thickenedData, 0, 0);

      // Calculate top-left position from center coordinates
      const areaTopLeftX = x - width / 2;
      const areaTopLeftY = y - height / 2;

      // Draw the processed signature to the main canvas, centered in the signature area
      ctx.drawImage(tempCanvas, areaTopLeftX + offsetX, areaTopLeftY + offsetY);
      resolve();
    };
    img.onerror = reject;
    img.src = signatureDataUrl;
  });
}

/**
 * Generate PIC.png with Step 1 and Step 2 data
 */
export async function generatePIC(
  step1Data: {
    missionerName: string;
    nation: string;
    date: Date | undefined;
    church: string;
  },
  step2Data: {
    partnerName: string;
    amount: string;
    denomination: "PHP" | "USD";
    email: string;
    mobile: string;
    localChurch: string;
  },
  countriesData: Array<{ name: string; code: string }>,
): Promise<Blob> {
  const img = await loadImage("/images/PIC.png");
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Draw the base image
  ctx.drawImage(img, 0, 0);

  // Get country name
  const country = countriesData.find((c) => c.code === step1Data.nation);
  const nationName = country?.name || step1Data.nation;

  // Format date as MM/DD/YYYY
  const formattedDate = step1Data.date
    ? `${String(step1Data.date.getMonth() + 1).padStart(2, "0")} / ${String(step1Data.date.getDate()).padStart(2, "0")} / ${step1Data.date.getFullYear()}`
    : "";

  // Format amount with denomination
  const formattedAmount = step2Data.amount
    ? `${step2Data.denomination} ${parseFloat(step2Data.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "";

  // Calculate absolute positions based on image dimensions
  const positions = {
    partnerName: {
      x: PIC_POSITIONS.partnerName.x * canvas.width,
      y: PIC_POSITIONS.partnerName.y * canvas.height,
    },
    email: {
      x: PIC_POSITIONS.email.x * canvas.width,
      y: PIC_POSITIONS.email.y * canvas.height,
    },
    mobile: {
      x: PIC_POSITIONS.mobile.x * canvas.width,
      y: PIC_POSITIONS.mobile.y * canvas.height,
    },
    localChurch: {
      x: PIC_POSITIONS.localChurch.x * canvas.width,
      y: PIC_POSITIONS.localChurch.y * canvas.height,
    },
    missionerName: {
      x: PIC_POSITIONS.missionerName.x * canvas.width,
      y: PIC_POSITIONS.missionerName.y * canvas.height,
    },
    amount: {
      x: PIC_POSITIONS.amount.x * canvas.width,
      y: PIC_POSITIONS.amount.y * canvas.height,
    },
    nation: {
      x: PIC_POSITIONS.nation.x * canvas.width,
      y: PIC_POSITIONS.nation.y * canvas.height,
    },
    travelDate: {
      x: PIC_POSITIONS.travelDate.x * canvas.width,
      y: PIC_POSITIONS.travelDate.y * canvas.height,
    },
    sendingChurch: {
      x: PIC_POSITIONS.sendingChurch.x * canvas.width,
      y: PIC_POSITIONS.sendingChurch.y * canvas.height,
    },
  };

  // Draw Partner section
  if (step2Data.partnerName) {
    drawText(
      ctx,
      step2Data.partnerName,
      positions.partnerName.x,
      positions.partnerName.y,
      canvas.width * 0.25,
      FONT_SIZE_PIC,
    );
  }
  if (step2Data.email) {
    drawText(ctx, step2Data.email, positions.email.x, positions.email.y, canvas.width * 0.25, FONT_SIZE_PIC);
  }
  if (step2Data.mobile) {
    drawText(ctx, step2Data.mobile, positions.mobile.x, positions.mobile.y, canvas.width * 0.25, FONT_SIZE_PIC);
  }
  if (step2Data.localChurch) {
    drawText(
      ctx,
      step2Data.localChurch,
      positions.localChurch.x,
      positions.localChurch.y,
      canvas.width * 0.25,
      FONT_SIZE_PIC,
    );
  }

  // Draw Recipient section
  if (step1Data.missionerName) {
    drawText(
      ctx,
      step1Data.missionerName,
      positions.missionerName.x,
      positions.missionerName.y,
      canvas.width * 0.25,
      FONT_SIZE_PIC,
    );
  }
  if (formattedAmount) {
    drawText(ctx, formattedAmount, positions.amount.x, positions.amount.y, canvas.width * 0.25, FONT_SIZE_PIC);
  }
  if (nationName) {
    drawText(ctx, nationName, positions.nation.x, positions.nation.y, canvas.width * 0.25, FONT_SIZE_PIC);
  }
  if (formattedDate) {
    drawText(ctx, formattedDate, positions.travelDate.x, positions.travelDate.y, canvas.width * 0.25, FONT_SIZE_PIC);
  }
  if (step1Data.church) {
    drawText(
      ctx,
      step1Data.church,
      positions.sendingChurch.x,
      positions.sendingChurch.y,
      canvas.width * 0.25,
      FONT_SIZE_PIC,
    );
  }

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      "image/png",
      1.0,
    );
  });
}

/**
 * Generate SAF.png or SAF_victory.png with Step 3 and Step 4 data
 */
export async function generateSAF(
  step2Data: {
    partnerName: string;
    isVictoryMember: boolean | null;
  },
  step3Data: {
    answers: Record<number, string>;
  },
  step4Data: {
    signatureType: "upload" | "draw" | null;
    uploadedFile: File | null;
    signatureDataUrl: string | null;
  },
  accountabilityQuestions: Array<{ question: string; choices: string[] }>,
): Promise<Blob> {
  // Determine which SAF image to use
  const imagePath = step2Data.isVictoryMember === true ? "/images/SAF_victory.png" : "/images/SAF.png";
  const img = await loadImage(imagePath);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Draw the base image
  ctx.drawImage(img, 0, 0);

  // Load check image
  const checkImg = await loadImage("/images/check.png");

  // Apply offset only if NOT a Victory member (using SAF.png)
  const offset =
    step2Data.isVictoryMember !== true
      ? {
          x: SAF_POSITIONS.offset.x * canvas.width,
          y: SAF_POSITIONS.offset.y * canvas.height,
        }
      : { x: 0, y: 0 };

  // Calculate absolute positions (apply offset to checkboxes only)
  const positions = {
    unableToGoTeamFund: {
      x: SAF_POSITIONS.unableToGoTeamFund.x * canvas.width + offset.x,
      y: SAF_POSITIONS.unableToGoTeamFund.y * canvas.height + offset.y,
    },
    unableToGoGeneralFund: {
      x: SAF_POSITIONS.unableToGoGeneralFund.x * canvas.width + offset.x,
      y: SAF_POSITIONS.unableToGoGeneralFund.y * canvas.height + offset.y,
    },
    reroutedRetain: {
      x: SAF_POSITIONS.reroutedRetain.x * canvas.width + offset.x,
      y: SAF_POSITIONS.reroutedRetain.y * canvas.height + offset.y,
    },
    reroutedGeneralFund: {
      x: SAF_POSITIONS.reroutedGeneralFund.x * canvas.width + offset.x,
      y: SAF_POSITIONS.reroutedGeneralFund.y * canvas.height + offset.y,
    },
    canceledGeneralFund: {
      x: SAF_POSITIONS.canceledGeneralFund.x * canvas.width + offset.x,
      y: SAF_POSITIONS.canceledGeneralFund.y * canvas.height + offset.y,
    },
    signature: {
      // Convert from top-left to center coordinates
      x: (SAF_POSITIONS.signature.x + SAF_POSITIONS.signature.width / 2) * canvas.width,
      y: (SAF_POSITIONS.signature.y + SAF_POSITIONS.signature.height / 2) * canvas.height,
      width: SAF_POSITIONS.signature.width * canvas.width,
      height: SAF_POSITIONS.signature.height * canvas.height,
    },
    partnerNameUnderSignature: {
      x: SAF_POSITIONS.partnerNameUnderSignature.x * canvas.width,
      y: SAF_POSITIONS.partnerNameUnderSignature.y * canvas.height,
    },
  };

  // Draw checkboxes based on Step 3 answers
  const answer0 = step3Data.answers[0];
  const answer1 = step3Data.answers[1];
  const answer2 = step3Data.answers[2];

  // Question 0: Unable to go
  if (answer0) {
    const question0 = accountabilityQuestions[0];
    const isTeamFund = answer0 === question0.choices[0];
    const isGeneralFund = answer0 === question0.choices[1];
    drawCheckbox(ctx, positions.unableToGoTeamFund.x, positions.unableToGoTeamFund.y, isTeamFund, checkImg);
    drawCheckbox(ctx, positions.unableToGoGeneralFund.x, positions.unableToGoGeneralFund.y, isGeneralFund, checkImg);
  }

  // Question 1: Rerouted
  if (answer1) {
    const question1 = accountabilityQuestions[1];
    const isRetain = answer1 === question1.choices[0];
    const isGeneralFund = answer1 === question1.choices[1];
    drawCheckbox(ctx, positions.reroutedRetain.x, positions.reroutedRetain.y, isRetain, checkImg);
    drawCheckbox(ctx, positions.reroutedGeneralFund.x, positions.reroutedGeneralFund.y, isGeneralFund, checkImg);
  }

  // Question 2: Canceled
  if (answer2) {
    const question2 = accountabilityQuestions[2];
    const isGeneralFund = answer2 === question2.choices[0];
    drawCheckbox(ctx, positions.canceledGeneralFund.x, positions.canceledGeneralFund.y, isGeneralFund, checkImg);
  }

  // Draw signature (signatureDataUrl should already be converted from uploadedFile in handleFinish)
  if (step4Data.signatureDataUrl) {
    await drawSignature(
      ctx,
      step4Data.signatureDataUrl,
      positions.signature.x,
      positions.signature.y,
      positions.signature.width,
      positions.signature.height,
    );
  }

  // Draw partner name under signature
  if (step2Data.partnerName) {
    drawText(
      ctx,
      step2Data.partnerName,
      positions.partnerNameUnderSignature.x,
      positions.partnerNameUnderSignature.y,
      canvas.width * 0.25,
      FONT_SIZE_SAF,
    );
  }

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      "image/png",
      1.0,
    );
  });
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
