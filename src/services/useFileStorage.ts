import supabase from "./firebase-config";

export async function InsertFile(chosenFiles: File, bucketName: string): Promise<string> {
    const changeFileName = chosenFiles.name
    .replace(/[^\w\s.-]/gi, '')
    .replace(/\s+/g, '-');

    const uniqueFileName = `${Date.now()}-${changeFileName}`;

    const { data: uploadedFile, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(uniqueFileName, chosenFiles, {
        cacheControl: '3600',
        contentType:  chosenFiles.type,
        upsert: false
    });

    if (uploadError) throw new Error('Failed to upload file');

    const { data: urlFiles } = supabase.storage
    .from(bucketName)
    .getPublicUrl(uploadedFile.path);

    if (!urlFiles || !urlFiles.publicUrl) throw new Error('Failed to get url file');

    return urlFiles.publicUrl;
}

export async function RemoveFiles(fileUrls: string, bucketName: string): Promise<void> {
    if (!fileUrls) return;
    const path = fileUrls.split(`${bucketName}/`)[1];
    const { error } = await supabase.storage
    .from(bucketName)
    .remove([decodeURIComponent(path)]);

    if (error) throw new Error('Failed to delete files data');
}