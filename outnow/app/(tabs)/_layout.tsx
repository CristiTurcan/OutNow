import {Tabs} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {Dimensions} from 'react-native';

const screenHeight = Dimensions.get('window').height;
const headerHeight = screenHeight > 800 ? 70 : 50;


export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: '#1E3A8A',
                    borderTopWidth: 0,
                    height: 60,
                },
                tabBarActiveTintColor: '#FFFFFF',
                tabBarInactiveTintColor: '#A0AEC0',
                headerShown: true,
                headerTitle: '',
                headerStyle: {
                    backgroundColor: '#1E3A8A',
                    height: headerHeight,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="home-outline" color={color} size={size}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="events"
                options={{
                    title: 'My Events',
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="bookmark-outline" color={color} size={size}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({color, size}) => (
                        <Ionicons name="person-outline" color={color} size={size}/>
                    ),
                }}
            />
        </Tabs>
    );
}
