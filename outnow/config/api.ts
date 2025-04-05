import Constants from 'expo-constants';

const host =
    Constants.expoConfig?.hostUri ??
    ((Constants.manifest as any)?.debuggerHost as string | undefined);
const ip = host ? host.split(':')[0] : '192.168.1.13'; // fallback IP

export const BASE_URL = `http://${ip}:8080`;
