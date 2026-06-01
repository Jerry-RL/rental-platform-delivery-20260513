/** 预览环境车辆/证件图上传（前端读图或 Mock 接口） */

export const VEHICLE_IMAGE_MAX_BYTES = 800 * 1024;
export const VEHICLE_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

export type UploadImageResult = {
  url: string;
  fileName: string;
  size: number;
  mimeType: string;
};

export const readImageFileAsDataUrl = (file: File): Promise<UploadImageResult> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("仅支持 JPG / PNG / WebP 图片"));
      return;
    }
    if (file.size > VEHICLE_IMAGE_MAX_BYTES) {
      reject(new Error(`图片不能超过 ${Math.round(VEHICLE_IMAGE_MAX_BYTES / 1024)}KB`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      resolve({
        url,
        fileName: file.name,
        size: file.size,
        mimeType: file.type
      });
    };
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });

/** @deprecated 请使用 readImageFileAsDataUrl + 上传接口返回的 dataUrl */
export const mockVehicleImageUrlFromFile = (_file: File): string => {
  return "";
};
