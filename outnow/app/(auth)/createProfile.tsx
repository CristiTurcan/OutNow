import React, {useState} from 'react';
import {
    ActionSheetIOS,
    Keyboard,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {router, useLocalSearchParams} from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import 'react-native-get-random-values';
import CustomButton from "@/components/customButton";
import CustomBackButton from "@/components/customBackButton";
import Constants from 'expo-constants';
import globalStyles from "@/styles/globalStyles";
import useProfile from '@/hooks/useProfile';
import useAuth from '@/hooks/useAuth';
import {useImagePicker} from '@/hooks/useImagePicker';
import AvatarPicker from "@/components/AvatarPicker";
import useBusinessProfile from '@/hooks/useBusinessProfile';
import tempStore from "@/services/tempStore";


export default function CreateProfile() {
    const [bio, setBio] = useState('');
    const [gender, setGender] = useState('');
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [location, setLocation] = useState('');
    const [coords, setCoords] = useState({lat: null, lng: null})
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [ageError, setAgeError] = useState('');
    const googleApiKey = Constants.expoConfig?.extra?.googleApiKey;
    const {user} = useAuth();
    const {updateProfile, loading: profileLoading, error: profileError} = useProfile();
    const {photoUri, photoBase64, openCamera, openLibrary} = useImagePicker();
    const {isBusiness, email, username, password} = useLocalSearchParams();
    const isBusinessAccount = isBusiness === 'true';
    const {loading: businessProfileLoading, error: businessProfileError} = useBusinessProfile();


    const handleAddPhoto = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Take Photo', 'Choose from Library'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        openCamera();
                    } else if (buttonIndex === 2) {
                        openLibrary();
                    }
                }
            );
        } else {
            setShowPhotoOptions(true);
        }
    };

    const calculateAndSetAge = (birthDate: Date | null, setAgeError: (error: string) => void): number => {
        if (!birthDate) {
            setAgeError('Please select your date of birth.');
            return 0;
        }
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            setAgeError('You must be at least 18 years old.');
        } else {
            setAgeError('');
        }
        return age;
    };

    const handleConfirm = (selectedDate: Date) => {
        const age = calculateAndSetAge(selectedDate, setAgeError);
        setDateOfBirth(selectedDate);
        setShowDatePicker(false);
    };

    const handleNext = () => {
        tempStore.photoBase64 = photoBase64 || '';

        router.push(`(auth)/addInterests` +
            `?isBusiness=${isBusiness}` +
            `&email=${email}` +
            `&username=${username}` +
            `&password=${password}` +
            `&bio=${bio}` +
            `&gender=${gender}` +
            `&dateOfBirth=${dateOfBirth ? dateOfBirth.toLocaleDateString('en-CA') : ''}` +
            `&location=${location}` +
            `&latitude=${coords.lat ?? ''}` +
            `&longitude=${coords.lng ?? ''}`
        );
    };


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={globalStyles.container} edges={['top', 'left', 'right']}>
                {/*Header*/}
                <View style={globalStyles.headerRow}>
                    <CustomBackButton text="" style={globalStyles.backButton}/>
                    <Text style={globalStyles.title}>Create Profile</Text>
                </View>

                {/* Body */}
                <View style={globalStyles.bodyContainer}>
                    {/* Avatar Section */}
                    <AvatarPicker
                        photoUri={photoUri ?? null}
                        photoBase64={photoBase64}
                        onPress={handleAddPhoto}
                    />


                    {/* Bio */}
                    <Text style={styles.fieldLabel}>Bio</Text>
                    <TextInput
                        style={styles.bioInput}
                        placeholder="Tell us about yourself"
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        maxLength={150}
                        onPress={() => {
                            setShowDatePicker(false);
                        }}
                    />
                    {bio.length === 150 && (
                        <Text style={globalStyles.errorText}>Character limit reached: 150/150</Text>
                    )}

                    {/* Gender Picker Modal */}
                    {!isBusinessAccount && (
                        <>
                            {/* Gender */}
                            <Text style={styles.fieldLabel}>Gender</Text>
                            <TouchableOpacity
                                style={styles.genderButton}
                                onPress={() => {
                                    setShowDatePicker(false);
                                    setShowGenderPicker(true);
                                }}
                            >
                                <Text style={[styles.genderButtonText, !gender && globalStyles.placeholderText]}>
                                    {gender ? gender : "Select your gender"}
                                </Text>

                            </TouchableOpacity>
                            <Modal
                                visible={showGenderPicker}
                                transparent
                                animationType="none"
                                onRequestClose={() => setShowGenderPicker(false)}
                            >
                                <TouchableWithoutFeedback onPress={() => setShowGenderPicker(false)}>
                                    <View style={styles.modalContainer}>
                                        <TouchableWithoutFeedback>
                                            <View style={styles.modalContent}>
                                                <Picker
                                                    selectedValue={gender}
                                                    onValueChange={(itemValue) => {
                                                        setGender(itemValue);
                                                        setShowGenderPicker(false);
                                                    }}
                                                    style={styles.genderPicker}
                                                >
                                                    <Picker.Item label="" value=""/>
                                                    <Picker.Item label="Male" value="Male"/>
                                                    <Picker.Item label="Female" value="Female"/>
                                                    <Picker.Item label="Prefer not to say" value="Prefer not to say"/>
                                                </Picker>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        </>
                    )}

                    {/* Date of Birth */}
                    {!isBusinessAccount && (
                        <>
                            <Text style={styles.fieldLabel}>Date of birth</Text>
                            <TouchableOpacity
                                style={styles.datePickerButton}
                                onPress={() => {
                                    setShowDatePicker(true);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.datePickerButtonText,
                                        !dateOfBirth && globalStyles.placeholderText
                                    ]}
                                >
                                    {dateOfBirth ? dateOfBirth.toDateString() : "Select your date of birth"}
                                </Text>


                            </TouchableOpacity>
                            {ageError !== '' && (
                                <Text style={globalStyles.errorText}>{ageError}</Text>
                            )}
                            <DateTimePickerModal
                                isVisible={showDatePicker}
                                mode="date"
                                maximumDate={dateOfBirth || new Date()}
                                onConfirm={handleConfirm}
                                onCancel={() => setShowDatePicker(false)}
                                pickerContainerStyleIOS={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            />
                        </>
                    )}

                    {/* Location with Google Places Autocomplete */}
                    <Text style={styles.fieldLabel}>Location</Text>
                    <GooglePlacesAutocomplete
                        placeholder="Where do you live?"
                        fetchDetails={true}
                        onPress={(data, details = null) => {
                            setLocation(data.description);
                            const {lat, lng} = details.geometry.location
                            setCoords({lat, lng})
                        }}
                        query={{
                            key: googleApiKey,
                            language: 'en',
                            types: '(regions)',
                        }}
                        styles={{
                            container: {
                                flex: 0,
                                width: '100%',
                                marginBottom: 12,
                                zIndex: 999,
                            },
                            listView: {
                                zIndex: 9999,
                                backgroundColor: '#fff',
                            },
                            textInput: styles.input,
                        }}
                        textInputProps={{
                            onTouchStart: () => {
                                setShowDatePicker(false);
                            },
                        }}
                    />

                    {/* Next Button */}
                    <View style={globalStyles.footer}>
                        <CustomButton
                            onPress={handleNext}
                            title={profileLoading ? "Updating..." : "Next"}
                            style={globalStyles.nextButton}
                        />
                    </View>
                </View>
                {Platform.OS !== 'ios' && (
                    <Modal
                        visible={showPhotoOptions}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowPhotoOptions(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setShowPhotoOptions(false)}>
                            <View style={styles.photoOptionsOverlay}>
                                <TouchableWithoutFeedback>
                                    <View style={styles.photoOptionsContainer}>
                                        <TouchableOpacity
                                            style={styles.photoOptionButton}
                                            onPress={() => {
                                                setShowPhotoOptions(false);
                                                openCamera();
                                            }}
                                        >
                                            <Text style={styles.photoOptionText}>Take Photo</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.photoOptionButton}
                                            onPress={() => {
                                                setShowPhotoOptions(false);
                                                openLibrary();
                                            }}
                                        >
                                            <Text style={styles.photoOptionText}>Choose from Library</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                )}
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    fieldLabel: {
        width: '100%',
        textAlign: 'left',
        marginBottom: 4,
        fontWeight: '500',
        fontSize: 14
    },
    bioInput: {
        width: '100%',
        height: 100,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 16,
        marginBottom: 12,
        fontSize: 16,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
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
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    genderButton: {
        width: '100%',
        minHeight: 48,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
        borderColor: '#ddd',
        fontSize: 16,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    genderButtonText: {
        fontSize: 16,
        color: '#333'
    },
    datePickerButton: {
        width: '100%',
        minHeight: 48,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
        borderColor: '#ddd',
        fontSize: 16,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    datePickerButtonText: {
        fontSize: 16,
        color: '#333'
    },
    nextButtonText: {color: '#fff', fontSize: 16},
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e1e1e1',
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarPlaceholderText: {color: '#9b9b9b'},
    avatar: {
        width: 100,
        height: 100, borderRadius: 50
    },
    avatarWrapper: {
        position: 'relative',
    },
    addIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#0D2C66',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIconText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 16,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12
    },
    genderPicker: {
        height: "auto",
        width: '100%'
    },
    photoOptionsOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoOptionsContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
    },
    photoOptionButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginVertical: 8,
        backgroundColor: '#0D2C66',
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    photoOptionText: {
        color: '#fff',
        fontSize: 16,
    },
});
