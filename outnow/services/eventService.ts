export async function fetchAllEvents() {
    const response = await fetch('http://localhost:8080/api/events');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}
