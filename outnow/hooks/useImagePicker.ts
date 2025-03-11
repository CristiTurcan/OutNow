import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerResult {
    photoUri: string | null;
    photoBase64: string | null;
    openCamera: () => Promise<void>;
    openLibrary: () => Promise<void>;
}

export function useImagePicker(): ImagePickerResult {
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [photoBase64, setPhotoBase64] = useState<string | null>(null);

    const pickImage = async (
        permissionRequest: () => Promise<{ granted: boolean }>,
        launchFunction: (options: ImagePicker.ImagePickerOptions) => Promise<ImagePicker.ImagePickerResult>
    ) => {
        const permissionResult = await permissionRequest();
        if (!permissionResult.granted) {
            alert('Permission to access is required!');
            return;
        }
        const result = await launchFunction({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: true,
        });
        if (!result.canceled) {
            const asset = result.assets[0];
            setPhotoUri(asset.uri);
            setPhotoBase64(asset.base64 ?? null);
        }
    };

    const openCamera = async () => {
        await pickImage(ImagePicker.requestCameraPermissionsAsync, ImagePicker.launchCameraAsync);
    };

    const openLibrary = async () => {
        await pickImage(ImagePicker.requestMediaLibraryPermissionsAsync, ImagePicker.launchImageLibraryAsync);
    };

    return { photoUri, photoBase64, openCamera, openLibrary };
}
