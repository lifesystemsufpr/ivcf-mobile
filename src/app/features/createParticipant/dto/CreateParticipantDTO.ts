export type GenderDTO = "FEMALE" | "MALE"

export type CreateParticipantPayloadDTO = {
    birthday: string; // yyyy-mm-dd
    scholarship: string,
    socio_economic_level: string;
    weight: number;
    height: number;
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    gender: GenderDTO;
    user: {
        fullName: string;
        email: string;

        gender: GenderDTO;
        active: boolean;
    };
};