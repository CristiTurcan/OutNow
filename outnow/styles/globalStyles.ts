import {StyleSheet} from "react-native";
import {green} from "react-native-reanimated/lib/typescript/Colors";

const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        position: "relative",
        // paddingBottom:0,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginHorizontal: 16,
        marginBottom: 20,
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
        paddingTop: 2,
    },
    centeredFooter: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        alignItems: 'center',
    },
    nextButton: {
        backgroundColor: '#0D2C66',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 28,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        margin: 10,
    },
    bodyContainer: {
        flex: 1,
        padding: 20,
        paddingTop: 30,
        alignItems: 'center',
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
    addIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#0D2C66',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIconText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 16,
        textAlign: 'center',
    },
});

export default globalStyles;
