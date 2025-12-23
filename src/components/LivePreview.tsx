"use client";

import { useEffect, useRef, useState } from "react";
import type { Step1Data } from "@/components/Step1Form";
import type { Step2Data } from "@/components/Step2Form";
import type { Step3Data } from "@/components/Step3Form";
import type { Step4Data } from "@/components/Step4Form";
import { PIC_POSITIONS, SAF_POSITIONS, TEXT_COLOR, FONT_SIZE_PIC, FONT_SIZE_SAF } from "@/lib/imageEditor";
import { accountabilityQuestions } from "@/lib/questions";

interface LivePreviewProps {
  currentStep: number;
  step1Data: Step1Data | null;
  step2Data: Step2Data | null;
  step3Data: Step3Data | null;
  step4Data: Step4Data | null;
  isVictoryMember: boolean | null;
  countriesData: Array<{ name: string; code: string }> | null;
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
  ctx.font = `${fontSize}px Arial, Helvetica, sans-serif`;
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
): Promise<void> {
  return new Promise((resolve, reject) => {
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

export function LivePreview({
  currentStep,
  step1Data,
  step2Data,
  step3Data,
  step4Data,
  isVictoryMember,
  countriesData,
}: LivePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [checkImage, setCheckImage] = useState<HTMLImageElement | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isFlippingIn, setIsFlippingIn] = useState(false);
  const [previousImageType, setPreviousImageType] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  // Convert uploaded file to data URL for preview
  useEffect(() => {
    if (step4Data?.uploadedFile && !step4Data.signatureDataUrl) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setSignatureDataUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(step4Data.uploadedFile);
    } else if (step4Data?.signatureDataUrl) {
      setSignatureDataUrl(step4Data.signatureDataUrl);
    } else {
      setSignatureDataUrl(null);
    }
  }, [step4Data?.uploadedFile, step4Data?.signatureDataUrl]);

  // Determine which image to show
  const shouldShowPIC = currentStep === 1 || currentStep === 2;
  const shouldShowSAF = currentStep === 3 || currentStep === 4;
  const imagePath = shouldShowPIC
    ? "/images/PIC.png"
    : shouldShowSAF
      ? isVictoryMember === true
        ? "/images/SAF_victory.png"
        : "/images/SAF.png"
      : null;

  const currentImageType = shouldShowPIC ? "PIC" : shouldShowSAF ? "SAF" : null;

  // Load check image once
  useEffect(() => {
    const checkImg = new Image();
    checkImg.crossOrigin = "anonymous";
    checkImg.onload = () => {
      setCheckImage(checkImg);
    };
    checkImg.src = "/images/check.png";
  }, []);

  // Load base image
  useEffect(() => {
    if (!imagePath) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Check if we need to flip (transitioning between PIC and SAF)
      const needsFlip = previousImageType !== null && previousImageType !== currentImageType;

      if (needsFlip) {
        setIsFlipping(true);
        setIsFlippingIn(false);

        // Wait for flip-out animation to complete (500ms) before switching image
        setTimeout(() => {
          setBaseImage(img);
          setIsFlipping(false);
          setIsFlippingIn(true);
          setTimeout(() => {
            setIsFlippingIn(false);
          }, 500);
        }, 1);
      } else {
        setBaseImage(img);
        setIsFlipping(false);
        setIsFlippingIn(false);
      }

      setPreviousImageType(currentImageType);
    };
    img.src = imagePath;
  }, [imagePath, currentImageType, previousImageType]);

  // Draw on canvas whenever data or base image changes
  useEffect(() => {
    if (!canvasRef.current || !baseImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = baseImage.width;
    canvas.height = baseImage.height;

    // Draw base image
    ctx.drawImage(baseImage, 0, 0);

    if (shouldShowPIC) {
      // Draw PIC form data (show whatever data is available, even if incomplete)
      const country =
        step1Data?.nation && countriesData ? countriesData.find((c) => c.code === step1Data.nation) : null;
      const nationName = country?.name || step1Data?.nation || "";

      const formattedDate = step1Data?.date
        ? `${String(step1Data.date.getMonth() + 1).padStart(2, "0")} / ${String(step1Data.date.getDate()).padStart(2, "0")} / ${step1Data.date.getFullYear()}`
        : "";

      const formattedAmount = step2Data?.amount
        ? `${step2Data.denomination || "PHP"} ${parseFloat(step2Data.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "";

      // Calculate absolute positions
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

      // Draw Partner section (show even if step2Data is null)
      if (step2Data?.partnerName) {
        drawText(
          ctx,
          step2Data.partnerName,
          positions.partnerName.x,
          positions.partnerName.y,
          canvas.width * 0.25,
          FONT_SIZE_PIC,
        );
      }
      if (step2Data?.email) {
        drawText(ctx, step2Data.email, positions.email.x, positions.email.y, canvas.width * 0.25, FONT_SIZE_PIC);
      }
      if (step2Data?.mobile) {
        drawText(ctx, step2Data.mobile, positions.mobile.x, positions.mobile.y, canvas.width * 0.25, FONT_SIZE_PIC);
      }
      if (step2Data?.localChurch) {
        drawText(
          ctx,
          step2Data.localChurch,
          positions.localChurch.x,
          positions.localChurch.y,
          canvas.width * 0.25,
          FONT_SIZE_PIC,
        );
      }

      // Draw Recipient section (show even if step1Data is null)
      if (step1Data?.missionerName) {
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
        drawText(
          ctx,
          formattedDate,
          positions.travelDate.x,
          positions.travelDate.y,
          canvas.width * 0.25,
          FONT_SIZE_PIC,
        );
      }
      if (step1Data?.church) {
        drawText(
          ctx,
          step1Data.church,
          positions.sendingChurch.x,
          positions.sendingChurch.y,
          canvas.width * 0.25,
          FONT_SIZE_PIC,
        );
      }
    } else if (shouldShowSAF) {
      // Apply offset only if NOT a Victory member (using SAF.png)
      const offset =
        isVictoryMember !== true
          ? {
              x: SAF_POSITIONS.offset.x * canvas.width,
              y: SAF_POSITIONS.offset.y * canvas.height,
            }
          : { x: 0, y: 0 };

      // Draw SAF form data (apply offset to checkboxes only)
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

      // Draw checkboxes (show even if step3Data is null)
      const answer0 = step3Data?.answers?.[0];
      const answer1 = step3Data?.answers?.[1];
      const answer2 = step3Data?.answers?.[2];

      if (answer0) {
        const question0 = accountabilityQuestions[0];
        const isTeamFund = answer0 === question0.choices[0];
        const isGeneralFund = answer0 === question0.choices[1];
        drawCheckbox(ctx, positions.unableToGoTeamFund.x, positions.unableToGoTeamFund.y, isTeamFund, checkImage);
        drawCheckbox(
          ctx,
          positions.unableToGoGeneralFund.x,
          positions.unableToGoGeneralFund.y,
          isGeneralFund,
          checkImage,
        );
      }

      if (answer1) {
        const question1 = accountabilityQuestions[1];
        const isRetain = answer1 === question1.choices[0];
        const isGeneralFund = answer1 === question1.choices[1];
        drawCheckbox(ctx, positions.reroutedRetain.x, positions.reroutedRetain.y, isRetain, checkImage);
        drawCheckbox(ctx, positions.reroutedGeneralFund.x, positions.reroutedGeneralFund.y, isGeneralFund, checkImage);
      }

      if (answer2) {
        const question2 = accountabilityQuestions[2];
        const isGeneralFund = answer2 === question2.choices[0];
        drawCheckbox(ctx, positions.canceledGeneralFund.x, positions.canceledGeneralFund.y, isGeneralFund, checkImage);
      }

      // Draw signature
      if (signatureDataUrl) {
        drawSignature(
          ctx,
          signatureDataUrl,
          positions.signature.x,
          positions.signature.y,
          positions.signature.width,
          positions.signature.height,
        ).catch(console.error);
      }

      // Draw partner name under signature
      if (step2Data?.partnerName) {
        drawText(
          ctx,
          step2Data.partnerName,
          positions.partnerNameUnderSignature.x,
          positions.partnerNameUnderSignature.y,
          canvas.width * 0.25,
          FONT_SIZE_SAF,
        );
      }
    }
  }, [
    baseImage,
    checkImage,
    shouldShowPIC,
    shouldShowSAF,
    step1Data,
    step2Data,
    step3Data,
    step4Data,
    countriesData,
    signatureDataUrl,
  ]);

  if (!imagePath) return null;

  return (
    <div className="w-full max-w-4xl flip-container">
      <div
        className={`bg-white rounded-lg shadow-lg p-4 flip-image ${isFlipping ? "flipping" : isFlippingIn ? "flipping-in" : ""}`}
      >
        <canvas ref={canvasRef} className="w-full h-auto" style={{ maxWidth: "100%", height: "auto" }} />
      </div>
    </div>
  );
}
