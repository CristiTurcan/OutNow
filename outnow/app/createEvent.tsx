import React, {useEffect, useState} from 'react';
import {
    Image,
    Keyboard,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';
import CustomButton from '@/components/customButton';
import CustomBackButton from '@/components/customBackButton';
import {useImagePicker} from '@/hooks/useImagePicker';
import useAuth from '@/hooks/useAuth';
import useBusinessProfile from '@/hooks/useBusinessProfile';
import {router} from 'expo-router';
import globalStyles from '@/styles/globalStyles';
import useEvents from '@/hooks/useEvents';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import tempStore from "@/services/tempStore";

export default function CreateEvent() {
    const {user, isBusiness} = useAuth();
    const {photoUri, photoBase64, openCamera, openLibrary} = useImagePicker();
    const googleApiKey = Constants.expoConfig?.extra?.googleApiKey;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [location, setLocation] = useState('');
    const [isLocationEditable, setIsLocationEditable] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [price, setPrice] = useState('');
    const {getBusinessProfile} = useBusinessProfile();
    const [businessProfile, setBusinessProfile] = useState(null);
    const [titleError, setTitleError] = useState('');
    const [priceError, setPriceError] = useState('');
    const [imageError, setImageError] = useState('');
    const [eventDateError, setEventDateError] = useState('');
    const [eventTimeError, setEventTimeError] = useState('');
    const [endDateError, setEndDateError] = useState('');
    const [endTimeError, setEndTimeError] = useState('');
    const [ticketsError, setTicketsError] = useState('');
    const {createEvent, loading: createLoading, error: createError} = useEvents();
    const [eventDateTime, setEventDateTime] = useState<Date | null>(null);
    const [showEventDatePicker, setShowEventDatePicker] = useState(false);
    const [eventTime, setEventTime] = useState<Date | null>(null);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [endDateTime, setEndDateTime] = useState<Date | null>(null);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [endTimeValue, setEndTimeValue] = useState<Date | null>(null);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [totalTickets, setTotalTickets] = useState('');
    const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({lat: null, lng: null});


    useEffect(() => {
        if (isBusiness && user?.email) {
            getBusinessProfile(user.email)
                .then(data => {
                    setBusinessProfile(data);
                    if (data?.location) {
                        setLocation(data.location);
                        setCoords({
                            lat: data.latitude,
                            lng: data.longitude,
                        });
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

        if (!eventDateTime) {
            setEventDateError('Event date is required.');
            hasError = true;
        } else {
            setEventDateError('');
        }

        if (!eventTime) {
            setEventTimeError('Event time is required.');
            hasError = true;
        } else {
            setEventTimeError('');
        }


        if (!endDateTime) {
            setEndDateError('End date is required.');
            hasError = true;
        } else {
            setEndDateError('');
        }

        if (!endTimeValue) {
            setEndTimeError('End time is required.');
            hasError = true;
        } else {
            setEndTimeError('');
        }

        if (!totalTickets.trim()) {
            setTicketsError('Number of tickets is required.');
            hasError = true;
        } else if (isNaN(Number(totalTickets)) || Number(totalTickets) <= 0) {
            setTicketsError('Please enter a valid number of tickets.');
            hasError = true;
        } else {
            setTicketsError('');
        }

        if (hasError) return;

        const eventData = {
            imageUrl: photoBase64!,
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            price: Number(price),
            eventDate: eventDateTime ? eventDateTime.toLocaleDateString('en-CA') : null,
            eventTime: eventTime
                ? eventTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
                : null,
            endDate: endDateTime ? endDateTime.toLocaleDateString('en-CA') : null,
            endTime: endTimeValue ? endTimeValue.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : null,
            totalTickets: Number(totalTickets),
            interestList: tempStore.eventInterests && tempStore.eventInterests.length > 0
                ? tempStore.eventInterests.join(',')
                : null,
            latitude: coords.lat,
            longitude: coords.lng,
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
            tempStore.eventInterests = [];
            router.push('/(tabs)/home');
        } catch (err) {
            console.error("Failed to create event", err);
        }

    };


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={globalStyles.container}>
                {/* Header */}
                <View style={globalStyles.headerRow}>
                    <CustomBackButton text="" style={globalStyles.backButton}/>
                    <Text style={globalStyles.title}>Create Event</Text>
                </View>
                {/* Body */}
                {/*<KeyboardAvoidingView*/}
                {/*    style={{flex: 1}}*/}
                {/*    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}*/}
                {/*    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}*/}
                {/*>*/}
                <KeyboardAwareScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
                >
                    <ScrollView contentContainerStyle={styles.bodyContainer}>
                        {/* Image Picker */}
                        <TouchableOpacity onPress={openLibrary} style={styles.imagePicker}>
                            {photoUri ? (
                                <Image source={{uri: photoUri}} style={styles.image}/>
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
                            placeholderTextColor='#9b9b9b'
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
                            placeholderTextColor='#9b9b9b'
                        />
                        {descriptionError !== '' && <Text style={globalStyles.errorText}>{descriptionError}</Text>}

                        {/*Date Time Picker*/}
                        <Text style={styles.fieldLabel}>Date</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowEventDatePicker(true)}
                        >
                            <Text
                                style={[styles.datePickerButtonText, !eventDateTime && globalStyles.placeholderText]}>
                                {eventDateTime ? eventDateTime.toLocaleDateString() : "Select date"}
                            </Text>
                        </TouchableOpacity>
                        {eventDateError !== '' && <Text style={globalStyles.errorText}>{eventDateError}</Text>}

                        {/* Time Picker */}
                        <Text style={styles.fieldLabel}>Time</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text style={[styles.datePickerButtonText, !eventTime && globalStyles.placeholderText]}>
                                {eventTime
                                    ? eventTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
                                    : "Select time"}
                            </Text>
                        </TouchableOpacity>
                        {eventTimeError !== '' && <Text style={globalStyles.errorText}>{eventTimeError}</Text>}

                        {/* End Date Field */}
                        <Text style={styles.fieldLabel}>End Date</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowEndDatePicker(true)}
                        >
                            <Text style={[styles.datePickerButtonText, !endDateTime && globalStyles.placeholderText]}>
                                {endDateTime
                                    ? endDateTime.toLocaleDateString()
                                    : 'Select end date'}
                            </Text>
                        </TouchableOpacity>
                        {endDateError !== '' && <Text style={globalStyles.errorText}>{endDateError}</Text>}

                        {/* End Time Field */}
                        <Text style={styles.fieldLabel}>End Time</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowEndTimePicker(true)}
                        >
                            <Text style={[styles.datePickerButtonText, !endTimeValue && globalStyles.placeholderText]}>
                                {endTimeValue
                                    ? endTimeValue.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
                                    : 'Select end time'}
                            </Text>
                        </TouchableOpacity>
                        {endTimeError !== '' && <Text style={globalStyles.errorText}>{endTimeError}</Text>}

                        {/* Location Field with Google Autocomplete */}
                        <Text style={styles.fieldLabel}>Location</Text>
                        <GooglePlacesAutocomplete
                            placeholder="Where is the event?"
                            fetchDetails={true}
                            onPress={(data, details = null) => {
                                setLocation(data.description);
                                setIsLocationEditable(false);
                                const {lat, lng} = details.geometry.location;
                                setCoords({lat, lng});
                            }}
                            query={{
                                key: googleApiKey,
                                language: 'en',
                                types: '(cities)',
                            }}
                            styles={{
                                container: {flex: 0, width: '100%'},
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
                            placeholderTextColor='#9b9b9b'
                        />
                        {priceError !== '' && <Text style={globalStyles.errorText}>{priceError}</Text>}

                        {/* Number of Tickets */}
                        <Text style={styles.fieldLabel}>Number of Tickets</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter number of tickets"
                            value={totalTickets}
                            onChangeText={setTotalTickets}
                            keyboardType="numeric"
                            placeholderTextColor="#9b9b9b"
                        />
                        {ticketsError !== '' && <Text style={globalStyles.errorText}>{ticketsError}</Text>}

                        {/*Select event type*/}
                        <TouchableOpacity
                            style={[styles.eventTypeButton, {alignSelf: 'center', width: '50%'}]}
                            onPress={() => router.push('/eventInterests')}
                        >
                            <Text style={styles.eventTypeButtonText}>Select Event Type</Text>
                        </TouchableOpacity>


                    </ScrollView>
                </KeyboardAwareScrollView>
                {/*</KeyboardAvoidingView>*/}

                {/* Footer Button */}
                <View style={[globalStyles.footer, {paddingBottom: 25}]}>
                    <CustomButton
                        title="Create Event"
                        onPress={handleCreateEvent}
                        style={globalStyles.nextButton}/>
                </View>
                <DateTimePickerModal
                    isVisible={showEventDatePicker}
                    mode="date"
                    date={eventDateTime || new Date()}
                    onConfirm={(selectedDate) => {
                        setEventDateTime(selectedDate);
                        setShowEventDatePicker(false);
                    }}
                    onCancel={() => setShowEventDatePicker(false)}
                    pickerContainerStyleIOS={{
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                />
                <DateTimePickerModal
                    isVisible={showTimePicker}
                    mode="time"
                    date={eventTime || new Date()}
                    onConfirm={(selectedTime) => {
                        setEventTime(selectedTime);
                        setShowTimePicker(false);
                    }}
                    onCancel={() => setShowTimePicker(false)}
                    pickerContainerStyleIOS={{
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                />
                <DateTimePickerModal
                    isVisible={showEndDatePicker}
                    mode="date"
                    date={endDateTime || new Date()}
                    minimumDate={eventDateTime || new Date()}
                    onConfirm={d => {
                        setEndDateTime(d);
                        setShowEndDatePicker(false);
                    }}
                    onCancel={() => setShowEndDatePicker(false)}
                    pickerContainerStyleIOS={{
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                />
                <DateTimePickerModal
                    isVisible={showEndTimePicker}
                    mode="time"
                    date={endTimeValue || new Date()}
                    onConfirm={t => {
                        setEndTimeValue(t);
                        setShowEndTimePicker(false);
                    }}
                    onCancel={() => setShowEndTimePicker(false)}
                    pickerContainerStyleIOS={{
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                />
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    bodyContainer: {
        padding: 20,
        paddingTop: 10,
        paddingBottom: 50,
    },
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
    eventTypeButton: {
        backgroundColor: '#f9f9f9',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
        alignItems: 'center',
        width: '60%',
        alignSelf: 'center',
        marginBottom: 12,
    },
    eventTypeButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: "500",
    },
});
