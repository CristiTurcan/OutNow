import { StyleSheet } from "react-native";

const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginHorizontal: 16,
        marginBottom: -10,
    },
    backButton: {
        position: "relative",
        top: 0,
        left: 0,
        zIndex: 0,
        marginRight: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: '#222',
        fontFamily: 'Roboto',
    },
    footer: {
        position: "absolute",
        bottom: 0,
        alignSelf: "center",
        width: '100%',
        alignItems: 'flex-end',
        backgroundColor: '#f2f2f2',
        paddingTop: 12,
    },
    nextButton: {
        backgroundColor: '#0D2C66',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 28,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
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
