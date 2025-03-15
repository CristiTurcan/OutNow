import React from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import globalStyles from "@/styles/globalStyles";
import CustomBackButton from "@/components/customBackButton";

export default function EditInterests() {
    return (
        <SafeAreaView>
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton}/>
                <Text style={globalStyles.title}>Edit Interests</Text>
            </View>
            <View style={styles.container}>
                <Text style={styles.text}>Edit Interests Screen</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 24,
    },
});
