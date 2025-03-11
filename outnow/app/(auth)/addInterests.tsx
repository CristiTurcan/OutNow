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
export default function AddInterests() {
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const {updateProfile, loading: profileLoading, error: profileError} = useProfile();
    const {user} = useAuth();
    const handleFinish = async () => {
        try {
            await updateProfile({
                email: user?.email || '',
                interestList: selectedInterests,
            });
            console.log("selected interests:", selectedInterests);
            router.replace('(tabs)/home');
        } catch (error) {
            console.error('Failed to update interests', error);
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

            {/*Body*/}
            <View style={styles.bodyContainer}>
                <FlatList
                    style={styles.cellContainer}
                    data={interestsData.interests}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    renderItem={renderInterestItem}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                />

                {/* Footer */}
                <View style={globalStyles.footer}>
                    <CustomButton
                        onPress={handleFinish}
                        title="Finish"
                        style={globalStyles.nextButton}
                    />
                </View>
            </View>
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