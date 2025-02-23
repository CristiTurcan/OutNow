import React, {useState} from 'react';
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
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {router} from 'expo-router';
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import 'react-native-get-random-values';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from "@/components/customButton";
import CustomBackButton from "@/components/customBackButton";


export default function CreateProfile() {
    const [bio, setBio] = useState('');
    const [gender, setGender] = useState(''); // default empty
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [dateOfBirth, setDateOfBirth] = useState(new Date()); // default date now
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [location, setLocation] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [ageError, setAgeError] = useState('');


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
            // For Android, use custom modal
            setShowPhotoOptions(true);
        }
    };

    const calculateAndSetAge = (birthDate: Date, setAgeError: (error: string) => void): number => {
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


    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const age = calculateAndSetAge(selectedDate, setAgeError);
            setDateOfBirth(selectedDate);
        }
    };

    const handleNext = () => {
        const age = calculateAndSetAge(dateOfBirth, setAgeError);
        // if (age < 18) return;    // this blocks next if age is not set properly
        router.replace('(auth)/addInterests');
    };


    const openCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Permission to access camera is required!');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            // result.assets is an array; get the first asset's URI.
            setPhotoUri(result.assets[0].uri);
        }
    };


    const openLibrary = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert('Permission to access media library is required!');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setPhotoUri(result.assets[0].uri);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            {/*Header*/}
            <View style={styles.headerRow}>
                <CustomBackButton text="" style={styles.backButton}/>
                <Text style={styles.title}>Create Profile</Text>
            </View>

            {/* Body */}
            <View style={styles.bodyContainer}>
                {/* Avatar Section */}
                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={handleAddPhoto}>
                        <View style={styles.avatarWrapper}>
                            {photoUri ? (
                                <Image source={{uri: photoUri}} style={styles.avatar}/>
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarPlaceholderText}>No photo</Text>
                                </View>
                            )}
                            <View style={styles.addIconContainer}>
                                <Text style={styles.addIconText}>+</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

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
                    <Text style={styles.charLimitText}>Character limit reached: 150/150</Text>
                )}

                {/* Gender */}
                <Text style={styles.fieldLabel}>Gender</Text>
                <TouchableOpacity
                    style={styles.genderButton}
                    onPress={() => {
                        setShowDatePicker(false);
                        setShowGenderPicker(true);
                    }}
                >
                    <Text style={styles.genderButtonText}>{gender ? gender : ''}</Text>
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

                {/* Date of Birth */}
                <Text style={styles.fieldLabel}>Date of birth</Text>
                <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => {
                        setShowDatePicker(true);
                    }}
                >
                    <Text style={styles.datePickerButtonText}>
                        {dateOfBirth.toDateString()}
                    </Text>
                </TouchableOpacity>
                {ageError !== '' && (
                    <Text style={styles.errorText}>{ageError}</Text>
                )}
                {showDatePicker && (
                    <DateTimePicker
                        value={dateOfBirth}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        maximumDate={new Date()}
                        onChange={handleDateChange}
                    />
                )}

                {/* Location with Google Places Autocomplete */}
                <Text style={styles.fieldLabel}>Location</Text>
                <GooglePlacesAutocomplete
                    placeholder="Where do you live?"
                    fetchDetails={true}
                    onPress={(data, details = null) => {
                        // extract detailed address info from details.address_components if needed.
                        setLocation(data.description);
                    }}
                    query={{
                        key: 'AIzaSyC1yLEaRaI8I0Axi2f8jzjSkqLEjiDbmbw',
                        language: 'en',
                        types: '(regions)',
                    }}
                    styles={{
                        container: {flex: 0, width: '100%', marginBottom: 12},
                        textInput: styles.input,
                    }}
                    textInputProps={{
                        onTouchStart: () => {
                            setShowDatePicker(false);
                        },
                    }}
                />

                {/* Next Button */}
                <View style={styles.footer}>
                    <CustomButton
                        onPress={handleNext}
                        title="Next"
                        style={styles.nextButton}
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginHorizontal: 16,
    },
    backButton: {
        position: "relative",
        top: 0,
        left: 0,
        zIndex: 0,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginLeft: 10,
        color: '#000',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    bodyContainer: {
        flex: 1,
        padding: 20, alignItems: 'center'
    },
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
    },
    charLimitText: {
        fontSize: 12,
        color: 'red', alignSelf: 'flex-end', marginBottom: 12
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
    genderButton: {
        width: '100%',
        minHeight: 48,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 16,
        marginBottom: 12,
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
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    datePickerButtonText: {
        fontSize: 16,
        color: '#333'
    },
    footer: {
        marginTop: 'auto', // Pushes the footer to the bottom of the container
        width: '100%',
        alignItems: 'flex-end', // Aligns children to the right
        paddingVertical: 20,
    },
    nextButton: {
        backgroundColor: '#0D2C66',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    nextButtonText: {color: '#fff', fontSize: 16},
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarPlaceholderText: {color: '#aaa'},
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
