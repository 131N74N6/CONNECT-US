const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface UploadResult {
    url: string;
    publicId: string;
    resourceType: 'image' | 'video';
}

export async function uploadToCloudinary(file: File): Promise<UploadResult> {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) throw new Error('Cloudinary configuration is missing');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
    formData.append('public_id', `${Date.now()}_${file.name}`);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Failed to upload file');

        const data = await response.json();
        return {
            url: data.secure_url,
            publicId: data.public_id,
            resourceType: data.resource_type,
        }
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('File upload failed');
    }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY);
    formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    const request = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/destroy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: formData
    });

    const response = await request.json();
    return response;
}

export function extractPublicIdFromUrl(url: string): string | null {
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|png|gif|mp4|webm|ogg)/);
    return matches ? matches[1] : null;
}