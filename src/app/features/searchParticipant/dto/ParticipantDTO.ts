export interface ParticipantDTO {
    id: string;
    fullName: string;
    email: string;
    gender: string;
    birthday: string;
    phone: string | null;
    active: boolean;
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
