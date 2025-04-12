import React, {useState} from 'react';
import {View, SafeAreaView, Text, StyleSheet, FlatList} from 'react-native';
import {router} from 'expo-router';
import CustomBackButton from "@/components/customBackButton";
import CustomButton from "@/components/customButton";
import globalStyles from "@/styles/globalStyles";
import interestsData from '../../assets/interests.json';
import AnimatedInterestCell from "@/components/AnimatedInterestCell";
import useProfile from '@/hooks/useProfile';
import useAuth from "@/hooks/useAuth";
import {useLocalSearchParams} from 'expo-router';
import useBusinessProfile from '@/hooks/useBusinessProfile';
import tempStore from "@/services/tempStore";
import InterestPicker from "@/components/InterestPicker";

export default function AddInterests() {
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const {updateProfile, loading: profileLoading, error: profileError} = useProfile();
    const {user, signUp} = useAuth();
    const {updateBusinessProfile} = useBusinessProfile();
    const {
        isBusiness,
        email,
        username,
        password,
        bio,
        gender,
        dateOfBirth,
        location,
    } = useLocalSearchParams();
    const isBusinessAccount = isBusiness === 'true';

    const emailStr = Array.isArray(email) ? email[0] : email;
    const usernameStr = Array.isArray(username) ? username[0] : username;
    const passwordStr = Array.isArray(password) ? password[0] : password;
    const bioStr = Array.isArray(bio) ? bio[0] : bio;
    const genderStr = Array.isArray(gender) ? gender[0] : gender;
    const dateOfBirthStr = Array.isArray(dateOfBirth) ? dateOfBirth[0] : dateOfBirth;
    const locationStr = Array.isArray(location) ? location[0] : location;
    const photoStr = tempStore.photoBase64 || '';

    const handleFinish = async () => {
        try {

            if (isBusinessAccount) {
                const businessData = {
                    email: emailStr,
                    username: usernameStr,
                    userPhoto: photoStr || '',
                    bio: bioStr,
                    location: locationStr,
                    interestList: selectedInterests,
                };
                await updateBusinessProfile(businessData);
                await signUp(emailStr, passwordStr, usernameStr, isBusinessAccount);

            } else {
                const profileData = {
                    email: emailStr,
                    userPhoto: photoStr || '',
                    bio: bioStr,
                    gender: genderStr,
                    dateOfBirth: dateOfBirthStr,
                    location: locationStr,
                    interestList: selectedInterests,
                };
                await signUp(emailStr, passwordStr, usernameStr, isBusinessAccount);
                await updateProfile(profileData);
            }

            router.replace('(tabs)/home');
        } catch (error) {
            console.error('Failed in final sign-up or profile update:', error);
        }
    };


    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(prev => prev.filter(item => item !== interest));
        } else {
            setSelectedInterests(prev => [...prev, interest]);
        }
    };

    const renderInterestItem = ({item}: { item: string }) => {
        return (
            <AnimatedInterestCell
                interest={item}
                isSelected={selectedInterests.includes(item)}
                onPress={() => toggleInterest(item)}
            />
        );
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            {/*Header*/}
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton}/>
                <Text style={globalStyles.title}>Add Interests</Text>
            </View>
            <InterestPicker
                interests={interestsData.interests}
                selectedInterests={selectedInterests}
                onToggleInterest={toggleInterest}
                onFinish={handleFinish}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    bodyContainer: {
        flex: 1,
        padding: 20,
        paddingTop: 30,
    },
    listContent: {
        paddingBottom: 80,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    cellContainer: {
        padding: 10,
    },
});