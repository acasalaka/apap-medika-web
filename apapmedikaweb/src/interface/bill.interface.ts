export interface BillInterface {
    status : string,
    id : string,
    appointmentId: string,
    appointmentFee : number,
    policyId : string,
    policyFee : number,
    reservationId : string,
    reservationFee : number,
    patientId : string,
    subtotal : number,
}

export interface UpdateStatusInterface{
    reservationId : string,
    status : string,
    policyId : string,
}
