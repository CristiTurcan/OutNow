export async function fetchAllEvents() {
    const response = await fetch('http://localhost:8080/event/v1/');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}
