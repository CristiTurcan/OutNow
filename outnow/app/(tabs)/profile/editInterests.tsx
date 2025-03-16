import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, SafeAreaView, FlatList, ScrollView} from 'react-native';
import {router} from 'expo-router';
import CustomBackButton from "@/components/customBackButton";
import CustomButton from "@/components/customButton";
import globalStyles from "@/styles/globalStyles";
import AnimatedInterestCell from "@/components/AnimatedInterestCell";
import interestsData from '../../../assets/interests.json';
import useProfile from '@/hooks/useProfile';
import useAuth from "@/hooks/useAuth";
import useUserProfile from "@/hooks/useUserProfile";

export default function EditInterests() {
    const {profile, updateProfile} = useProfile();
    const {user} = useAuth();
    const {getProfile, loading, error} = useUserProfile(user?.email);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    // On mount, initialize selectedInterests from profile data
    useEffect(() => {
        if (getProfile && getProfile.interestList) {
            const interestsArray = getProfile.interestList.split(',').map(item => item.trim());
            console.log("profile interests:", interestsArray);
            setSelectedInterests(interestsArray);
        }
    }, [getProfile]);


    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            // Deselect: remove from selectedInterests
            setSelectedInterests(prev => prev.filter(item => item !== interest));
        } else {
            // Select: add to selectedInterests
            setSelectedInterests(prev => [...prev, interest]);
        }
    };

    const handleSave = async () => {
        try {
            await updateProfile({
                email: user?.email || '',
                interestList: selectedInterests,
            });
            console.log("Updated interests:", selectedInterests);
            router.replace('(tabs)/home'); // Adjust navigation as needed
        } catch (error) {
            console.error('Failed to update interests', error);
        }
    };

    // Compute other interests by filtering out the selected ones
    const otherInterests = interestsData.interests.filter(
        (interest: string) => !selectedInterests.includes(interest)
    );

    // Render function for interest cell
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
            {/* Header */}
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton}/>
                <Text style={globalStyles.title}>Edit Interests</Text>
            </View>

            {/* Body */}
            <ScrollView contentContainerStyle={styles.bodyContainer}>
                <Text style={styles.sectionTitle}>Your interests</Text>
                <FlatList
                    data={selectedInterests}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    renderItem={renderInterestItem}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    scrollEnabled={false} // Disable individual scrolling for overall scroll
                />

                <Text style={styles.sectionTitle}>Other interests</Text>
                <FlatList
                    data={otherInterests}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    renderItem={renderInterestItem}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    scrollEnabled={false}
                />
            </ScrollView>

            {/* Footer */}
            <View style={globalStyles.footer}>
                <CustomButton
                    onPress={handleSave}
                    title="Save"
                    style={globalStyles.nextButton}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    bodyContainer: {
        padding: 20,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    listContent: {
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
});
