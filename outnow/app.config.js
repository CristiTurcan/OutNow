import 'dotenv/config';

export default {
    expo: {
        name: 'OutNow',
        slug: 'out-now',
        extra: {
            googleApiKey: process.env.GOOGLE_API_KEY,
        },
        // ... any other configuration
    },
};
