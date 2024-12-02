export interface PatientInterface {
    id: string,
    name: string,
    username: string,
    password: string,
    email: string,
    gender: string,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
    nik: string,
    birthPlace: string,
    birthDate: Date,
    pClass: number
}

export interface PatientOptionInterface {
  nik: string,
  name: string,
}
