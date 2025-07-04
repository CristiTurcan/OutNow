import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

export default function LoadingIndicator() {
    return (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0000ff"/>
        </View>
    );
}

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
