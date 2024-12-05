import type { PatientInterface } from "./patient.interface";

export interface ReservationInterface {
    id: string,
    patientId: string,
    dateIn: string,
    dateOut: string,
    totalFee: number,
    assignedNurse: string,
    roomId: string,
    listFacility : []
    pClass : number,
    
}

export interface ReservationRequestInterface {
    nik : string,
    dateIn: string,
    dateOut: string,
    roomId: string,
    patientId: string,
    appointmentId: string,
    patient : PatientInterface,
    facility : string,
    pClass : number,
    facilities: { id: string }[];
}

export interface UpdateReservationRequestInterface{
    dateIn: string,
    dateOut: string,
    roomId: string,
}
