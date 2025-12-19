"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface Step4Data {
  signatureType: "upload" | "draw" | null;
  uploadedFile: File | null;
  signatureDataUrl: string | null;
}

interface Step4FormProps {
  initialValues?: Partial<Step4Data>;
  onDataChange?: (data: Step4Data) => void;
}

export function Step4Form({ initialValues, onDataChange }: Step4FormProps) {
  const [selectedMethod, setSelectedMethod] = useState<"upload" | "draw" | null>(initialValues?.signatureType || null);
  const [signatureType, setSignatureType] = useState<"upload" | "draw" | null>(initialValues?.signatureType || null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(initialValues?.uploadedFile || null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(initialValues?.signatureDataUrl || null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize canvas on mount
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, []);

  // Notify parent of data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        signatureType,
        uploadedFile,
        signatureDataUrl,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signatureType, uploadedFile, signatureDataUrl]);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setUploadedFile(file);
      setSignatureType("upload");
      setSelectedMethod("upload");
      setSignatureDataUrl(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setSignatureType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Canvas drawing functions
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0]?.clientY : e.clientY;

    if (clientX === undefined || clientY === undefined) return { x: 0, y: 0 };

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const { x, y } = getCoordinates(e);

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setSignatureType("draw");
    setSelectedMethod("draw");
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    const { x, y } = getCoordinates(e);

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    setIsDrawing(false);
    const dataUrl = canvasRef.current.toDataURL();
    setSignatureDataUrl(dataUrl);
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setSignatureDataUrl(null);
      setSignatureType(null);
    }
  };

  // If no method selected, show selection buttons
  if (!selectedMethod) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Signature</h2>
          <p className="text-sm text-white/80 mt-1">
            Last step! Add your signature for the form to be complete. The app will not store your signature and will
            only use it to append to the document.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Upload Button */}
          <button
            type="button"
            onClick={() => setSelectedMethod("upload")}
            className="aspect-square border-2 border-white rounded-lg p-6 flex flex-col items-center justify-center gap-4 hover:border-white/80 hover:bg-white/10 transition-colors"
          >
            <Upload className="h-12 w-12 text-white" />
            <span className="text-lg font-semibold text-white">Upload</span>
          </button>

          {/* Draw Button */}
          <button
            type="button"
            onClick={() => setSelectedMethod("draw")}
            className="aspect-square border-2 border-white rounded-lg p-6 flex flex-col items-center justify-center gap-4 hover:border-white/80 hover:bg-white/10 transition-colors"
          >
            <Pencil className="h-12 w-12 text-white" />
            <span className="text-lg font-semibold text-white">Draw</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Signature</h2>
        <p className="text-sm text-white/70 mt-1">
          Last step! Add your signature for the form to be complete. The app will not store your signature and will only
          use it to append to the document.
        </p>
      </div>

      <div className="space-y-4">
        {/* Upload Option */}
        {selectedMethod === "upload" && (
          <div className="space-y-2">
            <Label className="text-white">Upload Signature</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragging ? "border-white bg-white/10" : "border-white/30 hover:border-white/50",
                signatureType === "upload" && "border-white bg-white/10",
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
              {uploadedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-medium text-white">{uploadedFile.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <img
                    src={URL.createObjectURL(uploadedFile)}
                    alt="Uploaded signature"
                    className="max-h-32 mx-auto rounded"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-white/50" />
                  <p className="text-sm text-white/70">Drop Files</p>
                  <p className="text-xs text-white/50">or click to browse</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Draw Signature Option */}
        {selectedMethod === "draw" && (
          <div className="space-y-2">
            <Label className="text-white">Draw Signature</Label>
            <div className="border rounded-lg p-4 bg-white">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="border rounded cursor-crosshair w-full max-w-full touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white/10 hover:border-white"
                  onClick={clearSignature}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
