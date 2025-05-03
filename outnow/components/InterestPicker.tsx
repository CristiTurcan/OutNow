import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import CustomButton from '@/components/customButton';
import AnimatedInterestCell from '@/components/AnimatedInterestCell';
import globalStyles from "@/styles/globalStyles";

interface InterestPickerProps {
    interests: string[];
    selectedInterests: string[];
    onToggleInterest: (interest: string) => void;
    onFinish: () => void;
    buttonText?: string;
}

const InterestPicker: React.FC<InterestPickerProps> = ({
                                                           interests,
                                                           selectedInterests,
                                                           onToggleInterest,
                                                           onFinish,
                                                           buttonText,
                                                       }) => {
    const renderItem = ({item}: { item: string }) => (
        <AnimatedInterestCell
            interest={item}
            isSelected={selectedInterests.includes(item)}
            onPress={() => onToggleInterest(item)}
        />
    );

    return (
        <View style={styles.container}>
            <FlatList
                style={styles.cellContainer}
                data={interests}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={renderItem}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
            />
            <View style={globalStyles.footer}>
                <CustomButton
                    title={buttonText || "Finish"}
                    onPress={onFinish}
                    style={globalStyles.nextButton}/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 30,
    },
    cellContainer: {
        padding: 10,
    },
    listContent: {
        paddingBottom: 80,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
});

export default InterestPicker;
