import React from 'react';
import {SafeAreaView, StyleSheet, Switch, Text, View,} from 'react-native';
import globalStyles from '@/styles/globalStyles';
import CustomBackButton from '@/components/customBackButton';
import useVisibilityPrefs from "@/hooks/useVisibilityPrefs";

export default function MyData() {
    const {prefs, loading, updatePref} = useVisibilityPrefs();

    if (loading) return <Text>Loading…</Text>;

    return (
        <SafeAreaView style={globalStyles.container}>
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton}/>
                <Text style={globalStyles.title}>My data</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Show date of birth</Text>
                <Switch
                    value={prefs.showDob}
                    onValueChange={(val) => updatePref('showDob', val)}
                />

            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Show location</Text>
                <Switch
                    value={prefs.showLocation}
                    onValueChange={(val) => updatePref('showLocation', val)}
                />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Show gender</Text>
                <Switch
                    value={prefs.showGender}
                    onValueChange={(val) => updatePref('showGender', val)}
                />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Show interests</Text>
                <Switch
                    value={prefs.showInterests}
                    onValueChange={(val) => updatePref('showInterests', val)}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    label: {fontSize: 16},
});
