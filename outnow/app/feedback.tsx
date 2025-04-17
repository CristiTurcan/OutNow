import React, {useEffect, useState} from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Keyboard,
    TouchableWithoutFeedback,
    TextInput,
    TouchableOpacity,
    Modal, Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {router, useLocalSearchParams} from 'expo-router';
import globalStyles from '@/styles/globalStyles';
import CustomBackButton from '@/components/customBackButton';
import CustomButton from '@/components/customButton';
import useFeedback from "@/hooks/useFeedback";
import {useAuthContext} from "@/contexts/AuthContext";
import useUserIdByEmail from "@/hooks/useUserByIdByEmail";

export default function Feedback() {
    const {user} = useAuthContext();
    const {userId} = useUserIdByEmail(user?.email || null);
    const {eventId} = useLocalSearchParams<{ eventId: string }>();
    const [rating, setRating] = useState('');
    const [comment, setComment] = useState('');
    const [showRatingPicker, setShowRatingPicker] = useState(false);
    const [ratingError, setRatingError] = useState('');
    const [commentError, setCommentError] = useState('');
    const {addFeedback, getFeedback} = useFeedback();
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const buttonStyle = feedbackSubmitted
        ? {...globalStyles.nextButton, backgroundColor: 'green'}
        : globalStyles.nextButton;


// When component mounts, fetch feedback and check if the current user already submitted
    useEffect(() => {
        async function fetchExistingFeedback() {
            const eventIdNumber = parseInt(eventId, 10);
            const feedbacks = await getFeedback(eventIdNumber);
            if (feedbacks) {
                const alreadySubmitted = feedbacks.some(fb => fb.userId === userId);
                setFeedbackSubmitted(alreadySubmitted);
            }
        }

        if (userId) {
            fetchExistingFeedback();
        }
    }, [userId, eventId]);

    useEffect(() => {
        const loadExisting = async () => {
            if (!userId) return;
            const eventIdNumber = parseInt(eventId, 10);
            const all = await getFeedback(eventIdNumber);
            if (all) {
                const mine = all.find(fb => fb.userId === userId);
                if (mine) {
                    setRating(mine.rating);
                    setComment(mine.comment || '');
                    setFeedbackSubmitted(true);
                }
            }
        };
        loadExisting();
    }, [userId]);


    const handleSend = async () => {
        // Validate that a rating is selected
        if (!rating) {
            setRatingError("Please select a rating.");
            return;
        } else {
            setRatingError("");
        }

        // Validate comment word count
        const words = comment.trim().split(/\s+/).filter(word => word.length > 0);
        if (words.length > 200) {
            setCommentError(`Word limit reached: ${words.length}/200`);
            return;
        } else {
            setCommentError("");
        }

        // Ensure we have a valid user id
        if (!userId) {
            console.error("User ID is not available");
            return;
        }

        try {
            const eventIdNumber = parseInt(eventId, 10);
            const result = await addFeedback(eventIdNumber, userId, rating, comment);
            if (result) {
                console.log("Feedback submitted successfully", result);
                setFeedbackSubmitted(true);
                // setRating('');
                // setComment('');
            }
        } catch (e) {
            console.error("Error sending feedback:", e);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={globalStyles.container}>
                {/* Header */}
                <View style={globalStyles.headerRow}>
                    <CustomBackButton text="" style={globalStyles.backButton}/>
                    <Text style={globalStyles.title}>Feedback</Text>
                </View>

                {/* Body */}
                <View style={globalStyles.bodyContainer}>
                    {/* Rating Input */}
                    <Text style={styles.fieldLabel}>Rating</Text>
                    <TouchableOpacity
                        style={styles.ratingButton}
                        onPress={() => !feedbackSubmitted && setShowRatingPicker(true)}
                    >
                        <Text style={[styles.ratingButtonText, !rating && globalStyles.placeholderText]}>
                            {rating ? rating : 'Select a rating'}
                        </Text>
                    </TouchableOpacity>
                    {ratingError !== '' && <Text style={globalStyles.errorText}>{ratingError}</Text>}

                    {/* Rating Picker Modal */}
                    <Modal
                        visible={showRatingPicker}
                        transparent
                        animationType="none"
                        onRequestClose={() => setShowRatingPicker(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setShowRatingPicker(false)}>
                            <View style={styles.modalContainer}>
                                <TouchableWithoutFeedback>
                                    <View style={styles.modalContent}>
                                        <Picker
                                            selectedValue={rating}
                                            onValueChange={(itemValue) => {
                                                setRating(itemValue);
                                                setShowRatingPicker(false);
                                            }}
                                            style={styles.picker}
                                        >
                                            <Picker.Item label="Select a rating" value=""/>
                                            <Picker.Item label="Very Bad" value="very bad"/>
                                            <Picker.Item label="Bad" value="bad"/>
                                            <Picker.Item label="Ok" value="ok"/>
                                            <Picker.Item label="Good" value="good"/>
                                            <Picker.Item label="Very Good" value="very good"/>
                                        </Picker>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                    {/* Comment Input */}
                    <Text style={styles.fieldLabel}>Comment (optional)</Text>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Write your feedback here..."
                        value={comment}
                        onChangeText={(text) => {
                            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
                            if (words.length <= 200) {
                                setComment(text);
                                setCommentError("");
                            } else {
                                setCommentError(`Word limit reached: ${words.length}/200`);
                            }
                        }}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        editable={!feedbackSubmitted}
                    />
                    {commentError !== '' && <Text style={globalStyles.errorText}>{commentError}</Text>}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <CustomButton
                        title={feedbackSubmitted ? "Sent" : "Send"}
                        onPress={feedbackSubmitted
                            ? () => Alert.alert("Feedback already sent")
                            : handleSend} disabled={feedbackSubmitted}
                        style={buttonStyle}
                    />

                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        padding: 16,
        paddingVertical: 5,
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f2f2f2',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 16,
        marginBottom: 10,
        fontWeight: '500',
    },
    fieldLabel: {
        width: '100%',
        textAlign: 'left',
        marginBottom: 4,
        fontWeight: '500',
        fontSize: 14,
    },
    ratingButton: {
        width: '100%',
        minHeight: 48,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
        borderColor: '#ddd',
    },
    ratingButtonText: {
        fontSize: 16,
        color: '#333',
    },
    commentInput: {
        width: '100%',
        height: 100,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 16,
        color: '#333',
        textAlignVertical: 'top',
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
    picker: {
        width: '100%',
        height: 200,
    },
});
