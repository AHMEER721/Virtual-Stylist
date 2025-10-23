
export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // The result is a data URL like "data:image/png;base64,iVBORw0KGgo..."
            // We need to extract the base64 part.
            const base64Data = result.split(',')[1];
            const mimeType = result.substring(result.indexOf(':') + 1, result.indexOf(';'));
            if (base64Data && mimeType) {
                resolve({ base64: base64Data, mimeType });
            } else {
                reject(new Error("Failed to parse file data."));
            }
        };
        reader.onerror = (error) => reject(error);
    });
};
