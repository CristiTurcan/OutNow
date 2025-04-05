import React, {useEffect, useState} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet, Platform, ActionSheetIOS} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Feather';
import globalStyles from "@/styles/globalStyles";
import CustomButton from "@/components/customButton";
import useUserProfile from '@/hooks/useUserProfile';
import useBusinessProfile from "@/hooks/useBusinessProfile";
import { useAuthContext } from '@/contexts/AuthContext';
import AvatarPicker from "@/components/AvatarPicker";
import { useImagePicker } from "@/hooks/useImagePicker";
import useProfile from "@/hooks/useProfile";


export default function Index() {
    const router = useRouter();
    const { user, signOut, isBusiness } = useAuthContext();
    const { updateExistingBusinessProfile, getBusinessProfile } = useBusinessProfile();
    const { getProfile: userProfile, loading: userProfileLoading, error: userProfileError } = useUserProfile(user?.email);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const { photoUri, photoBase64, openCamera, openLibrary } = useImagePicker();
    const { updateProfile } = useProfile();
    const [businessProfile, setBusinessProfile] = useState(null);
    const [bpLoading, setBpLoading] = useState(false);
    const [bpError, setBpError] = useState(null);

    useEffect(() => {
        if (isBusiness && user?.email) {
            setBpLoading(true);
            getBusinessProfile(user.email)
                .then(data => {
                    setBusinessProfile(data);
                    setBpLoading(false);
                })
                .catch(err => {
                    setBpError(err.message);
                    setBpLoading(false);
                });
        }
    }, [isBusiness, user?.email]);

    const profileData = isBusiness ? businessProfile : userProfile;

    useEffect(() => {
        if (photoBase64 && user?.email) {
            if (isBusiness) {
                updateExistingBusinessProfile(user.email, { userPhoto: photoBase64 })
                    .then(() => console.log("Business profile photo updated."))
                    .catch((error) => console.error("Error updating business profile photo:", error));
            } else {
                updateProfile({ email: user.email, userPhoto: photoBase64 })
                    .then(() => console.log("User profile photo updated."))
                    .catch((error) => console.error("Error updating user profile photo:", error));
            }
        }
    }, [photoBase64, isBusiness, user?.email]);

    const handleAddPhoto = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Take Photo', 'Choose from Library'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        openCamera();
                    } else if (buttonIndex === 2) {
                        openLibrary();
                    }
                }
            );
        } else {
            // For Android, use custom modal
            setShowPhotoOptions(true);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            router.replace('/(auth)/login');
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Logout failed. Please try again.");
        }
    };

    // Menu items for the list
    const menuItems = [
        { label: 'Edit Profile', icon: 'user', onPress: () => router.push('/(tabs)/profile/editProfile') },
        { label: 'Edit Interests', icon: 'tag', onPress: () => router.push('/(tabs)/profile/editInterests') },
        { label: 'Notification', icon: 'bell', onPress: () => router.push('/(tabs)/profile/notification') },
        { label: 'Information', icon: 'info', onPress: () => router.push('(tabs)/profile/information') },
    ];

    return (
        <View style={styles.container}>
            {/* Header / Index Info */}
            <View style={styles.profileContainer}>
                {/* Index Image */}
                <AvatarPicker
                    photoUri={photoUri ?? (profileData?.userPhoto ?? null)}
                    photoBase64={photoBase64}
                    onPress={handleAddPhoto}
                />


                <Text style={styles.profileName}>
                    {profileData?.username || 'User'}
                </Text>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={item.onPress}
                    >
                        <View style={styles.menuItemLeft}>
                            <Icon name={item.icon} size={20} color="#333" style={styles.menuIcon} />
                            <Text style={styles.menuLabel}>{item.label}</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color="#333" />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={globalStyles.centeredFooter}>
                <CustomButton
                    onPress={handleLogout}
                    title="Log out"
                    style={globalStyles.nextButton}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
        resizeMode: 'cover',
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    profileRole: {
        fontSize: 16,
        color: '#555',
        marginTop: 5,
    },
    menuContainer: {
        marginTop: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: 10,
    },
    menuLabel: {
        fontSize: 16,
        color: '#333',
    },
});
