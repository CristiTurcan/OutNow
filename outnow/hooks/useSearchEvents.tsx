import {useCallback, useState} from 'react';
import {BASE_URL} from "@/config/api";

export interface EventDTO {
    eventId: number;
    title: string;
    location: string;
}

export default function useSearchEvents() {
    const [results, setResults] = useState<EventDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchEvents = useCallback(async (q: string) => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(`${BASE_URL}/events/search?q=${encodeURIComponent(q)}`);
            if (!resp.ok) throw new Error(await resp.text());
            setResults(await resp.json());
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {results, loading, error, searchEvents};
}
