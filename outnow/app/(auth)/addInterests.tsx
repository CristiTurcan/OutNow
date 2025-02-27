import React from 'react';
import { View, SafeAreaView, Text, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import CustomBackButton from "@/components/customBackButton";
import CustomButton from "@/components/customButton";
import globalStyles from "@/styles/globalStyles";

export default function AddInterests() {
    const handleFinish = () => {
        // Once the user has chosen interests, navigate to home
        router.replace('(tabs)/home');
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            {/*Header*/}
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton}/>
                <Text style={globalStyles.title}>Add Interests</Text>
            </View>

            {/*Body*/}
            <View style={globalStyles.bodyContainer}>
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
});
