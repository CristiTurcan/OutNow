export interface EventDTO {
    eventId: number;
    title: string;
    description: string;
    imageUrl: string;
    location: string;
    price: number;
    createdAt: string;
    updatedAt: string;
    businessAccountId: number | null;
    eventDate: string;
    eventTime: string;
    interestList: string;
}
