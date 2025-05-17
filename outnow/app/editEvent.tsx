import React, {useEffect, useState} from 'react';
import {
    Image,
    Keyboard,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import CustomBackButton from '@/components/customBackButton';
import CustomButton from '@/components/customButton';
import globalStyles from '@/styles/globalStyles';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import useEvents from "@/hooks/useEvents";
import useEventDetails from "@/hooks/useEventDetails";
import {useImagePicker} from '@/hooks/useImagePicker';
import tempStore from "@/services/tempStore";
import {GooglePlacesAutocomplete} from "react-native-google-places-autocomplete";
import Constants from "expo-constants";

export default function EditEvent() {
    const {eventId} = useLocalSearchParams() as { eventId: string };
    const router = useRouter();
    const [eventData, setEventData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const {updateEvent} = useEvents();
    const googleApiKey = Constants.expoConfig?.extra?.googleApiKey;
    const [isLocationEditable, setIsLocationEditable] = useState(false);
    const {event, refetch} = useEventDetails(Number(eventId));
    const {photoUri, photoBase64, openLibrary} = useImagePicker();
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [endDateError, setEndDateError] = useState('');
    const [endTimeError, setEndTimeError] = useState('');


    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [eventDate, setEventDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [eventTime, setEventTime] = useState<Date | null>(null);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [eventImageUri, setEventImageUri] = useState<string | null>(null);
    const [imageError, setImageError] = useState('');
    const [eventInterests, setEventInterests] = useState<string[]>([]);
    const [interestError, setInterestError] = useState('');
    const [titleError, setTitleError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [locationError, setLocationError] = useState('');
    const [priceError, setPriceError] = useState('');
    const [dateError, setDateError] = useState('');
    const [timeError, setTimeError] = useState('');
    const [totalTickets, setTotalTickets] = useState('');
    const [ticketsError, setTicketsError] = useState('');
    const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({lat: null, lng: null});


    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setDescription(event.description);
            setLocation(event.location);
            setPrice(event.price.toString());
            if (event.eventDate) {
                setEventDate(new Date(event.eventDate));
            }
            if (event.eventTime) {
                const now = new Date();
                const [hour, minute] = event.eventTime.split(':').map(Number);
                now.setHours(hour, minute, 0, 0);
                setEventTime(now);
            }
            if (event.imageUrl) {
                setEventImageUri(event.imageUrl);
            }
            if (event.interestList) {
                const interestsArray = event.interestList.split(',').map(item => item.trim());
                setEventInterests(interestsArray);
                tempStore.eventInterests = interestsArray;
            }
            if (event.endDate) {
                setEndDate(new Date(event.endDate));
            }
            if (event.endTime) {
                const t = new Date();
                const [h, m] = event.endTime.split(':').map(Number);
                t.setHours(h, m, 0, 0);
                setEndTime(t);
            }
            if (event.totalTickets != null) {
                setTotalTickets(event.totalTickets.toString());
            } else {
                setEventInterests([]);
                tempStore.eventInterests = [];
            }
        }
    }, [event]);

    useEffect(() => {
        if (photoUri) {
            setEventImageUri(photoUri);
        }
    }, [photoUri]);

    const handleUpdateEvent = async () => {

        let hasError = false;

        if (!title.trim()) {
            setTitleError('Title is required.');
            hasError = true;
        } else {
            setTitleError('');
        }

        if (!description.trim()) {
            setDescriptionError('Description is required.');
            hasError = true;
        } else {
            setDescriptionError('');
        }

        if (!location.trim()) {
            setLocationError("No location provided.");
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

        if (!eventImageUri) {
            setImageError('Event image is required.');
            hasError = true;
        } else {
            setImageError('');
        }

        if (!eventDate) {
            setDateError('Event date is required.');
            hasError = true;
        } else {
            setDateError('');
        }

        if (!eventTime) {
            setTimeError('Event time is required.');
            hasError = true;
        } else {
            setTimeError('');
        }

        if (!endDate) {
            setEndDateError('End date is required.');
            hasError = true;
        } else {
            setEndDateError('');
        }
        if (!endTime) {
            setEndTimeError('End time is required.');
            hasError = true;
        } else {
            setEndTimeError('');
        }
        if (!totalTickets.trim()) {
            setTicketsError('Number of tickets is required.');
            hasError = true;
        } else if (isNaN(Number(totalTickets)) || Number(totalTickets) <= 0) {
            setTicketsError('Please enter a valid ticket count.');
            hasError = true;
        } else {
            setTicketsError('');
        }
        if (!tempStore.eventInterests || tempStore.eventInterests.length === 0) {
            setInterestError('Please select at least one event type.');
            hasError = true;
        } else {
            setInterestError('');
        }

        if (hasError) return;

        const updatedEvent = {
            imageUrl: photoBase64 ? photoBase64 : eventImageUri!,
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            price: Number(price),
            eventDate: eventDate ? eventDate.toLocaleDateString('en-CA') : null,
            eventTime: eventTime
                ? eventTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
                : null,
            endDate: endDate ? endDate.toLocaleDateString('en-CA') : null,
            endTime: endTime ? endTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : null,
            totalTickets: Number(totalTickets),
            interestList: (tempStore.eventInterests && tempStore.eventInterests.length > 0)
                ? tempStore.eventInterests.join(',')
                : null,
            latitude: coords.lat,
            longitude: coords.lng,
        };

        try {
            await updateEvent(Number(eventId), updatedEvent);
            tempStore.eventInterests = [];
            router.replace('/(tabs)/home');
        } catch (err) {
            console.error("Failed to update event", err);
        }
    };

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error}</Text>;

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={globalStyles.container}>
                {/* Header */}
                <View style={globalStyles.headerRow}>
                    <CustomBackButton text="" style={globalStyles.backButton}/>
                    <Text style={globalStyles.title}>Edit Profile</Text>
                </View>
                <KeyboardAwareScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
                >
                    <ScrollView contentContainerStyle={styles.contentContainer}>

                        <TouchableOpacity onPress={openLibrary} style={styles.imagePicker}>
                            {eventImageUri ? (
                                <Image source={{uri: eventImageUri}} style={styles.image}/>
                            ) : (
                                <Text style={styles.placeholderText}>Select Event Image</Text>
                            )}
                        </TouchableOpacity>
                        {imageError !== '' && <Text style={globalStyles.errorText}>{imageError}</Text>}


                        {/* Title Field */}
                        <Text style={styles.fieldLabel}>Title</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                        />
                        {titleError !== '' && <Text style={globalStyles.errorText}>{titleError}</Text>}

                        {/* Description Field */}
                        <Text style={styles.fieldLabel}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                        {descriptionError !== '' && <Text style={globalStyles.errorText}>{descriptionError}</Text>}

                        {/* Date Picker */}
                        <Text style={styles.fieldLabel}>Date</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={[styles.datePickerButtonText, !eventDate && globalStyles.placeholderText]}>
                                {eventDate ? eventDate.toLocaleDateString() : "Select date"}
                            </Text>
                        </TouchableOpacity>
                        {dateError !== '' && <Text style={globalStyles.errorText}>{dateError}</Text>}

                        <DateTimePickerModal
                            isVisible={showDatePicker}
                            mode="date"
                            date={eventDate || new Date()}
                            onConfirm={(selectedDate) => {
                                setEventDate(selectedDate);
                                setShowDatePicker(false);
                            }}
                            onCancel={() => setShowDatePicker(false)}
                        />

                        {/* Time Picker */}
                        <Text style={styles.fieldLabel}>Time</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text style={[styles.datePickerButtonText, !eventTime && globalStyles.placeholderText]}>
                                {eventTime ? eventTime.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : "Select time"}
                            </Text>
                        </TouchableOpacity>
                        {timeError !== '' && <Text style={globalStyles.errorText}>{timeError}</Text>}

                        {/* End Date */}
                        <Text style={styles.fieldLabel}>End Date</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowEndDatePicker(true)}
                        >
                            <Text style={[styles.datePickerButtonText, !endDate && globalStyles.placeholderText]}>
                                {endDate ? endDate.toLocaleDateString() : 'Select end date'}
                            </Text>
                        </TouchableOpacity>
                        {endDateError !== '' && <Text style={globalStyles.errorText}>{endDateError}</Text>}

                        {/* End Time */}
                        <Text style={styles.fieldLabel}>End Time</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowEndTimePicker(true)}
                        >
                            <Text style={[styles.datePickerButtonText, !endTime && globalStyles.placeholderText]}>
                                {endTime ? endTime.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : 'Select end time'}
                            </Text>
                        </TouchableOpacity>
                        {endTimeError !== '' && <Text style={globalStyles.errorText}>{endTimeError}</Text>}

                        {/* Location Field */}
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

                        {/* Price Field */}
                        <Text style={styles.fieldLabel}>Price</Text>
                        <TextInput
                            style={styles.input}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                        {priceError !== '' && <Text style={globalStyles.errorText}>{priceError}</Text>}

                        {/* Number of Tickets */}
                        <Text style={styles.fieldLabel}>Number of Tickets</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter total tickets"
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
                        {interestError !== '' && <Text style={globalStyles.errorText}>{interestError}</Text>}

                        <DateTimePickerModal
                            isVisible={showTimePicker}
                            mode="time"
                            date={eventTime || new Date()}
                            onConfirm={(selectedTime) => {
                                setEventTime(selectedTime);
                                setShowTimePicker(false);
                            }}
                            onCancel={() => setShowTimePicker(false)}
                        />
                        <DateTimePickerModal
                            isVisible={showEndDatePicker}
                            mode="date"
                            date={endDate || new Date()}
                            minimumDate={eventDate || new Date()}
                            onConfirm={d => {
                                setEndDate(d);
                                setShowEndDatePicker(false);
                            }}
                            onCancel={() => setShowEndDatePicker(false)}
                        />

                        <DateTimePickerModal
                            isVisible={showEndTimePicker}
                            mode="time"
                            date={endTime || new Date()}
                            onConfirm={t => {
                                setEndTime(t);
                                setShowEndTimePicker(false);
                            }}
                            onCancel={() => setShowEndTimePicker(false)}
                        />

                    </ScrollView>
                </KeyboardAwareScrollView>

                {/* Footer */}
                <View style={[globalStyles.footer, {paddingBottom: 25}]}>
                    <CustomButton
                        title="Save"
                        onPress={handleUpdateEvent}
                        style={globalStyles.nextButton}/>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        padding: 20,
        paddingTop: 10,
        paddingBottom: 50,
    },
    fieldLabel: {
        fontSize: 16,
        marginBottom: 4,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    datePickerButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    datePickerButtonText: {
        fontSize: 16,
        color: '#333',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    placeholderText: {
        color: '#9b9b9b',
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
