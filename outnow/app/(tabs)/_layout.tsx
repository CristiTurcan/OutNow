import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Platform, StyleSheet } from 'react-native';

const screenHeight = Dimensions.get('window').height;
const headerHeight = screenHeight > 800 ? 70 : 50; // Larger header for larger screens


export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: '#1E3A8A', // Navy blue background
                    borderTopWidth: 0,
                    height: 60,
                },
                tabBarActiveTintColor: '#FFFFFF', // Active tab color
                tabBarInactiveTintColor: '#A0AEC0', // Inactive tab color
                headerShown: true,
                headerTitle: '',
                headerStyle: {
                    backgroundColor: '#1E3A8A', // Custom color for the header background
                    height: headerHeight,
                },
                headerTintColor: '#fff', // Color of the header text (if any) and back button
                headerTitleStyle: {
                    fontWeight: 'bold', // Optional: customize the font style
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="events"
                options={{
                    title: 'My Events',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="bookmark-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}
