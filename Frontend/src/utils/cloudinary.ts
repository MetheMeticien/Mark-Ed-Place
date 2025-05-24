interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

interface UploadOptions {
  uploadPreset?: string;
  folder?: string;
  tags?: string[];
}

/**
 * Uploads a single image to Cloudinary
 * @param file The image file to upload
 * @param options Additional upload options
 * @returns Promise with the Cloudinary response
 */
export const uploadImage = async (
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', options.uploadPreset || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
  
  if (options.folder) {
    formData.append('folder', options.folder);
  }
  
  if (options.tags) {
    formData.append('tags', options.tags.join(','));
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

/**
 * Uploads multiple images to Cloudinary
 * @param files Array of image files to upload
 * @param options Additional upload options
 * @returns Promise with array of Cloudinary responses
 */
export const uploadMultipleImages = async (
  files: File[],
  options: UploadOptions = {}
): Promise<CloudinaryResponse[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, options));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images to Cloudinary:', error);
    throw error;
  }
};

/**
 * Generates a Cloudinary URL with optional transformations
 * @param publicId The public ID of the image
 * @param options Transformation options
 * @returns The generated URL
 */
export const getImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
    format?: string;
  } = {}
): string => {
  const transformations = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);

  const transformationString = transformations.length > 0 
    ? transformations.join(',') + '/'
    : '';

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}${publicId}`;
};

/**
 * Deletes an image from Cloudinary
 * @param publicId The public ID of the image to delete
 * @returns Promise with the deletion result
 */
export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
          timestamp: Math.floor(Date.now() / 1000),
          signature: '', // You'll need to generate this on the backend for security
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete image from Cloudinary');
    }

    const result = await response.json();
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};
