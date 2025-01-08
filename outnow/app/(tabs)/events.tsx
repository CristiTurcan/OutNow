import { View, Text, StyleSheet, Image } from 'react-native';
import {Ionicons} from "@expo/vector-icons";

export default function Events() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Events Page</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    text: {
        fontSize: 18,
        color: '#333',
    },
});
