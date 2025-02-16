// app/auth/_layout.tsx
import { Stack } from 'expo-router';

const AuthLayout = () => {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="login" options={{ title: "Login" }} />
			<Stack.Screen name="signup" options={{ title: "Sign Up" }} />
			<Stack.Screen name="forgot-password" options={{ title: "Forgot Password" }} />
		</Stack>
	);
};

export default AuthLayout;
