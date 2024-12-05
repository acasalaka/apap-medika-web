export interface PolicyInterface {
    id : string,
    companyId : string,
    patientId : string,
    status : string,
    expiryDate : Date,
    totalCoveraged: number,
    totalCovered : number,
    createdAt : Date,
    updatedAt : Date,
}

export interface PolicyOptionInterface{
    id : string,
    totalCoveraged : number,
    totalCovered : number,
}