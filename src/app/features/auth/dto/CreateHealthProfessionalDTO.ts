export interface CreateHealthProfessionalPayloadDTO {
    speciality: string;
    user: {
        fullName: string;
        email: string;
        phone: string;
        gender: "FEMALE" | "MALE";
        password?: string;
        active: boolean;
    };
}

export interface CreateHealthProfessionalResponseDTO {
    id: number;
    speciality: string;
    user: {
        id: number;
        fullName: string;
        email: string;
        phone: string;
        gender: string;
        active: boolean;
    };
}
