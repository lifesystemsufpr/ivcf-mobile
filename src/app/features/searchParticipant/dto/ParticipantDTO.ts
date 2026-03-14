export interface ParticipantDTO {
    id: string;
    fullName: string;
    email: string;
    gender: string;
    birthday: string;
    phone: string | null;
    active: boolean;
    // Optional details
    weight?: number;
    height?: number; // cm
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

export interface ParticipantPageDTO {
    data: ParticipantDTO[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        lastPage: number;
    };
}
