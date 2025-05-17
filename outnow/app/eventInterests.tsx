import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {router} from 'expo-router';
import InterestPicker from '@/components/InterestPicker';
import tempStore from '@/services/tempStore';
import interestsData from '../assets/interests.json';
import globalStyles from "@/styles/globalStyles";
import CustomBackButton from "@/components/customBackButton";

export default function EventInterests() {
    const [selectedInterests, setSelectedInterests] = useState<string[]>(tempStore.eventInterests || []);

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(prev => prev.filter(item => item !== interest));
        } else {
            setSelectedInterests(prev => [...prev, interest]);
        }
    };

    const handleFinish = () => {
        tempStore.eventInterests = selectedInterests;
        router.back();
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton}/>
                <Text style={globalStyles.title}>Select event type</Text>
            </View>
            <InterestPicker
                interests={interestsData.interests}
                selectedInterests={selectedInterests}
                onToggleInterest={toggleInterest}
                onFinish={handleFinish}
                buttonText={"Select"}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 16},
    title: {fontSize: 20, fontWeight: 'bold', marginBottom: 16},
});
