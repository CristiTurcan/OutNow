import 'dotenv/config';

export default {
    expo: {
        name: 'OutNow',
        slug: 'outnow',
        owner: "cristiturcan",
        extra: {
            googleApiKey: process.env.GOOGLE_API_KEY,
            "eas": {
                "projectId": "8e627f7b-5a22-42c1-9a47-0b1887baaf58"
            }
        },
        plugins: [
            "expo-build-properties",
            "expo-router"
        ],
        // ... any other configuration
    },

};
