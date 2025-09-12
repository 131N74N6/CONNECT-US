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

export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video'): Promise<void> {
    if (!CLOUDINARY_CLOUD_NAME) throw new Error('Cloudinary configuration is missing');

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                public_id: publicId,
                api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
                timestamp: Date.now(),
                signature: process.env.REACT_APP_CLOUDINARY_API_SECRET, 
            })}
        );

        if (!response.ok) throw new Error('Failed to delete file');
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('File deletion failed');
    }
}