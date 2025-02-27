import { StyleSheet } from "react-native";

const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginHorizontal: 16,
    },
    backButton: {
        position: "relative",
        top: 0,
        left: 0,
        zIndex: 0,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginLeft: 10,
        color: '#000',
    },
    footer: {
        marginTop: 'auto',
        width: '100%',
        alignItems: 'flex-end',
        paddingVertical: 20,
    },
    nextButton: {
        backgroundColor: '#0D2C66',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    bodyContainer: {
        flex: 1,
        padding: 20,
        paddingTop: 30,
        alignItems: 'center'
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: -8,
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    placeholderText: {
        color: '#aaa',
    },
});

export default globalStyles;
