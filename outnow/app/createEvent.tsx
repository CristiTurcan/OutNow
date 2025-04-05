import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';
import CustomButton from '@/components/customButton';
import CustomBackButton from '@/components/customBackButton';
import { useImagePicker } from '@/hooks/useImagePicker';
import useAuth from '@/hooks/useAuth';
import useBusinessProfile from '@/hooks/useBusinessProfile';
import { router } from 'expo-router';
import globalStyles from '@/styles/globalStyles';
import useCreateEvent from '@/hooks/useCreateEvent';

export default function CreateEvent() {
    const { user, isBusiness } = useAuth();
    const { photoUri, photoBase64, openCamera, openLibrary } = useImagePicker();
    const googleApiKey = Constants.expoConfig?.extra?.googleApiKey;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [location, setLocation] = useState('');
    const [isLocationEditable, setIsLocationEditable] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [price, setPrice] = useState('');
    const { getBusinessProfile } = useBusinessProfile();
    const [businessProfile, setBusinessProfile] = useState(null);
    const [titleError, setTitleError] = useState('');
    const [priceError, setPriceError] = useState('');
    const [imageError, setImageError] = useState('');
    const { createEvent, loading: createLoading, error: createError } = useCreateEvent();



    useEffect(() => {
        if (isBusiness && user?.email) {
            getBusinessProfile(user.email)
                .then(data => {
                    setBusinessProfile(data);
                    if (data?.location) {
                        setLocation(data.location);
                    }
                })
                .catch(err => console.error("Error fetching business profile:", err));
        }
    }, [isBusiness, user?.email]);

    useEffect(() => {
        const words = description.trim().split(/\s+/).filter(Boolean);
        if (words.length > 150) {
            setDescriptionError(`Maximum 150 words allowed. Current count: ${words.length}`);
        } else {
            setDescriptionError('');
        }
    }, [description]);

    const handlePriceChange = (text: string) => {
        const sanitized = text.replace(/[^0-9.]/g, '');
        setPrice(sanitized);
    };

    const handleCreateEvent = async () => {
        let hasError = false;

        if (!title.trim()) {
            setTitleError('Title is required.');
            hasError = true;
        } else {
            setTitleError('');
        }

        if (!photoBase64) {
            setImageError('Event image is required.');
            hasError = true;
        } else {
            setImageError('');
        }

        if (!description.trim()) {
            setDescriptionError('Description is required.');
            hasError = true;
        } else {
            if (description.trim().split(/\s+/).filter(Boolean).length <= 150) {
                setDescriptionError('');
            }
        }

        if (!location.trim()) {
            setLocationError("No location provided");
            hasError = true;
        } else {
            setLocationError('');
        }

        if (!price.trim() || isNaN(Number(price))) {
            setPriceError('Please enter a valid price.');
            hasError = true;
        } else {
            setPriceError('');
        }

        if (hasError) return;

        const eventData = {
            imageUrl: photoBase64!,
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            price: Number(price),
        };

        if (!user?.email) {
            return;
        }

        if (!businessProfile?.id) {
            console.error("Business account ID is missing.");
            return;
        }

        try {
            await createEvent(businessProfile.id, eventData);
            router.push('/(tabs)/home');
        } catch (err) {
            console.error("Failed to create event", err);
        }

    };



    return (
        <SafeAreaView style={globalStyles.container}>
            {/* Header */}
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton} />
                <Text style={globalStyles.title}>Create Event</Text>
            </View>

            {/* Body */}
            <View style={globalStyles.bodyContainer}>
                {/* Image Picker */}
                <TouchableOpacity onPress={openLibrary} style={styles.imagePicker}>
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.image} />
                    ) : (
                        <Text style={styles.placeholderText}>Select Event Image</Text>
                    )}
                </TouchableOpacity>
                {imageError !== '' && <Text style={globalStyles.errorText}>{imageError}</Text>}

                {/* Title Field */}
                <Text style={styles.fieldLabel}>Title</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                />
                {titleError !== '' && <Text style={globalStyles.errorText}>{titleError}</Text>}

                {/* Description Field */}
                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter description"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />
                {descriptionError !== '' && <Text style={globalStyles.errorText}>{descriptionError}</Text>}

                {/* Location Field with Google Autocomplete */}
                <Text style={styles.fieldLabel}>Location</Text>
                <GooglePlacesAutocomplete
                    placeholder="Where is the event?"
                    fetchDetails={true}
                    onPress={(data, details = null) => {
                        setLocation(data.description);
                        setIsLocationEditable(false);
                    }}
                    query={{
                        key: googleApiKey,
                        language: 'en',
                        types: '(cities)',
                    }}
                    styles={{
                        container: { flex: 0, width: '100%' },
                        textInput: styles.input,
                    }}
                    textInputProps={{
                        onTouchStart: () => setIsLocationEditable(true),
                        value: location,
                        onChangeText: (text) => {
                            if (isLocationEditable) {
                                setLocation(text);
                            }
                        },
                        onBlur: () => {
                            if (!location.trim()) {
                                setLocationError("No location provided");
                            } else {
                                setLocationError("");
                            }
                            setIsLocationEditable(false);
                        },
                    }}
                />
                {locationError !== '' && <Text style={globalStyles.errorText}>{locationError}</Text>}

                {/* Price and Currency */}
                <Text style={styles.fieldLabel}>Price</Text>
                <TextInput
                    style={styles.input}
                    placeholder="$0.00"
                    value={price}
                    onChangeText={handlePriceChange}
                    keyboardType="numeric"
                />
                {priceError !== '' && <Text style={globalStyles.errorText}>{priceError}</Text>}

                {/* Footer Button */}
                <View style={globalStyles.footer}>
                    <CustomButton title="Create Event" onPress={handleCreateEvent} style={globalStyles.nextButton} />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    imagePicker: {
        height: 150,
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    image: {
        height: '100%',
        width: '100%',
        borderRadius: 8,
    },
    placeholderText: {
        color: '#9b9b9b',
    },
    fieldLabel: {
        width: '100%',
        textAlign: 'left',
        marginBottom: 4,
        fontWeight: '500',
        fontSize: 14,
        color: '#333',
    },
    input: {
        width: '100%',
        minHeight: 48,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 16,
        marginBottom: 12,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    priceInput: {
        flex: 1,
    },
    currencyPicker: {
        width: 100,
        height: Platform.OS === 'ios' ? 150 : 50,
    },
    priceSymbol: {
        fontSize: 16,
        marginRight: 8,
        alignSelf: 'center',
    },
});
