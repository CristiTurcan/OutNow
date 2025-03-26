import React, {useState, useEffect, useRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Modal,
    TouchableWithoutFeedback,
    Platform,
    ActionSheetIOS,
    ActivityIndicator,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {router} from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';
import globalStyles from '@/styles/globalStyles';
import CustomButton from '@/components/customButton';
import CustomBackButton from '@/components/customBackButton';
import useProfile from '@/hooks/useProfile';
import useAuth from '@/hooks/useAuth';
import {useImagePicker} from '@/hooks/useImagePicker';
import useUserProfile from "@/hooks/useUserProfile";
import useBusinessProfile from '@/hooks/useBusinessProfile';

export default function EditProfile() {
    const {user, isBusiness} = useAuth();
    const {getProfile, loading, error} = useUserProfile(user?.email);
    const {profile, updateProfile, loading: profileLoading, error: profileError} = useProfile();
    const {photoUri, photoBase64, openCamera, openLibrary} = useImagePicker();
    const [bio, setBio] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [location, setLocation] = useState('');
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [ageError, setAgeError] = useState('');
    const googleApiKey = Constants.expoConfig?.extra?.googleApiKey;
    const [isLocationEditable, setIsLocationEditable] = useState(false);
    const [locationError, setLocationError] = useState('');
    const {updateExistingBusinessProfile, getBusinessProfile} = useBusinessProfile();
    const [businessProfile, setBusinessProfile] = useState(null);

    useEffect(() => {
        if (isBusiness && user?.email) {
            getBusinessProfile(user.email)
                .then(data => setBusinessProfile(data))
                .catch(err => console.error("Error fetching business profile:", err));
        }
    }, [isBusiness, user?.email]);


    useEffect(() => {
        const profileData = isBusiness ? businessProfile : getProfile;
        if (profileData) {
            setBio(profileData.bio || '');
            setGender(profileData.gender || '');
            setLocation(profileData.location || '');
            if (profileData.dateOfBirth) {
                setDateOfBirth(new Date(profileData.dateOfBirth));
            } else {
                setDateOfBirth(null);
            }
        }
    }, [isBusiness, businessProfile, getProfile]);


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
        calculateAndSetAge(selectedDate, setAgeError);
        setDateOfBirth(selectedDate);
        setShowDatePicker(false);
    };

    const handleSave = async () => {
        const age = calculateAndSetAge(dateOfBirth, setAgeError);
        if (age < 18 && !isBusiness) return;

        if (!location.trim()) {
            setLocationError("No location provided");
            // return; // Prevent saving if location is empty.
        }

        const commonData = {
            email: user?.email || '',
            bio,
            location,
        };

        if (!user?.email) {
            console.error("User email is missing.");
            return;
        }

        try {
            if (isBusiness) {
                await updateExistingBusinessProfile(user.email, commonData);
            } else {
                const profileData = {
                    ...commonData,
                    gender,
                    dateOfBirth: dateOfBirth ? dateOfBirth.toLocaleDateString('en-CA') : '',
                };
                await updateProfile(profileData);
            }
            router.push('/(tabs)/profile');
        } catch (error) {
            console.error('Failed to update profile', error);
        }
    };

    if (profileLoading) {
        return (
            <SafeAreaView style={globalStyles.container}>
                <ActivityIndicator size="large" color="#0D2C66"/>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={globalStyles.container}>
            {/* Header */}
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton}/>
                <Text style={globalStyles.title}>Edit Profile</Text>
            </View>

            {/* Body */}
            <View style={globalStyles.bodyContainer}>
                {/* Bio */}
                <Text style={styles.fieldLabel}>Bio</Text>
                <TextInput
                    style={styles.bioInput}
                    placeholder="Tell us about yourself"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    maxLength={150}
                />
                {bio.length === 150 && (
                    <Text style={globalStyles.errorText}>Character limit reached: 150/150</Text>
                )}

                {!isBusiness && (
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
                                {gender ? gender : 'Select your gender'}
                            </Text>
                        </TouchableOpacity>

                        {/* Gender Picker Modal */}
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

                {!isBusiness && (
                    <>
                        {/* Date of Birth */}
                        <Text style={styles.fieldLabel}>Date of birth</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => {
                                setShowDatePicker(true);
                            }}
                        >
                            <Text style={[styles.datePickerButtonText, !dateOfBirth && globalStyles.placeholderText]}>
                                {dateOfBirth ? dateOfBirth.toDateString() : 'Select your date of birth'}
                            </Text>
                        </TouchableOpacity>
                        {ageError !== '' && <Text style={globalStyles.errorText}>{ageError}</Text>}
                        <DateTimePickerModal
                            isVisible={showDatePicker}
                            mode="date"
                            date={dateOfBirth || new Date()}
                            maximumDate={new Date()}
                            onConfirm={handleConfirm}
                            onCancel={() => setShowDatePicker(false)}
                        />
                    </>
                )}


                {/* Location */}
                <Text style={styles.fieldLabel}>Location</Text>
                <GooglePlacesAutocomplete
                    placeholder="Where do you live?"
                    fetchDetails={true}
                    onPress={(data, details = null) => {
                        setLocation(data.description);
                        setIsLocationEditable(false); // reset editing mode after selection
                    }}
                    query={{
                        key: googleApiKey,
                        language: 'en',
                        types: '(regions)',
                    }}
                    styles={{
                        container: {flex: 0, width: '100%'},
                        textInput: styles.input,
                    }}
                    textInputProps={{
                        onTouchStart: () => {
                            setShowDatePicker(false);
                            setIsLocationEditable(true); // enable editing when touched
                        },
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
                {locationError !== '' && (
                    <Text style={globalStyles.errorText}>{locationError}</Text>
                )}


                {/* Save Button */}
                <View style={globalStyles.footer}>
                    <CustomButton
                        onPress={handleSave}
                        title={profileLoading ? 'Saving...' : 'Save'}
                        style={globalStyles.nextButton}
                    />
                </View>
            </View>

            {/* Android Photo Options Modal */}
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
    );
}

const styles = StyleSheet.create({
    fieldLabel: {
        width: '100%',
        textAlign: 'left',
        marginBottom: 4,
        fontWeight: '500',
        fontSize: 14,
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
        color: '#333',
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
        color: '#333',
    },
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
        alignItems: 'center',
    },
    avatarPlaceholderText: {color: '#9b9b9b'},
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
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
        borderTopRightRadius: 12,
    },
    genderPicker: {
        height: 'auto',
        width: '100%',
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
