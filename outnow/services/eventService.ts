import {BASE_URL} from "@/config/api";

export async function fetchAllEvents() {
    const response = await fetch(`${BASE_URL}/events`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}
