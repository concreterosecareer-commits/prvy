/**
 * Browser-only image validation and optimization utilities.
 * Import only from client components.
 */

/* ── Accepted formats ───────────────────────────────────────── */

export const ACCEPTED_IMAGE_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

export const ACCEPTED_MIME_TYPES = Object.keys(ACCEPTED_IMAGE_TYPES);

/** Human-readable label shown in error messages and file inputs */
export const ACCEPTED_FORMAT_LABEL = "JPG, PNG, or WEBP";

/** Input accept attribute value */
export const ACCEPT_ATTR =
  ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

/* ── Limits ──────────────────────────────────────────────────── */

const MAX_INPUT_MB = 20;
const MAX_INPUT_BYTES = MAX_INPUT_MB * 1024 * 1024;
const MIN_DIMENSION_PX = 50;
const MAX_DIMENSION_PX = 1920;
const OUTPUT_MIME = "image/jpeg";
const OUTPUT_QUALITY = 0.85;

/* ── Validation ──────────────────────────────────────────────── */

export interface ValidationError {
  code: "format" | "size" | "dimensions";
  message: string;
}

/**
 * Validates file format and size before any processing.
 * Returns null on success, or a ValidationError.
 */
export function validateImageFile(file: File): ValidationError | null {
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return {
      code: "format",
      message: `Unsupported format. Please upload a ${ACCEPTED_FORMAT_LABEL} file.`,
    };
  }
  if (file.size > MAX_INPUT_BYTES) {
    return {
      code: "size",
      message: `File is too large (${formatBytes(file.size)}). Maximum is ${MAX_INPUT_MB} MB.`,
    };
  }
  return null;
}

/* ── Optimization ────────────────────────────────────────────── */

export interface OptimizeResult {
  blob: Blob;
  previewUrl: string;   // object URL of the optimized blob — caller must revoke
  originalBytes: number;
  optimizedBytes: number;
  width: number;
  height: number;
}

/**
 * Loads the image, scales it down to at most 1920 px on the longest side,
 * draws it onto a canvas, and returns a JPEG blob at 85 % quality.
 *
 * Rejects with a user-readable Error on any failure.
 */
export function optimizeImage(file: File): Promise<OptimizeResult> {
  return new Promise((resolve, reject) => {
    const inputUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(inputUrl);

      const ow = img.naturalWidth;
      const oh = img.naturalHeight;

      if (ow < MIN_DIMENSION_PX || oh < MIN_DIMENSION_PX) {
        reject(
          new Error(
            `Image is too small (${ow}×${oh} px). ` +
              `Minimum is ${MIN_DIMENSION_PX}×${MIN_DIMENSION_PX} px.`
          )
        );
        return;
      }

      // Scale down while preserving aspect ratio; never scale up
      const scale = Math.min(1, MAX_DIMENSION_PX / ow, MAX_DIMENSION_PX / oh);
      const w = Math.round(ow * scale);
      const h = Math.round(oh * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas is not supported in this browser."));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error("Image processing failed. Please try a different file.")
            );
            return;
          }
          resolve({
            blob,
            previewUrl: URL.createObjectURL(blob),
            originalBytes: file.size,
            optimizedBytes: blob.size,
            width: w,
            height: h,
          });
        },
        OUTPUT_MIME,
        OUTPUT_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(inputUrl);
      reject(
        new Error("Could not read the image. The file may be corrupted.")
      );
    };

    img.src = inputUrl;
  });
}

/* ── Formatting helpers ──────────────────────────────────────── */

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
