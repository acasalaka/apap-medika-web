export interface AppointmentInterface {
  id: string;
  doctorName: string;
  patientName: string;
  date: Date;
  diagnosis: string;
  treatments: string[];
  totalFee: number;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface AppointmentRequestInterface {
  nik: string,
  doctorId: string,
  date: Date,
}

export interface UpdateStatusInterface {
  id: string,
  status: number,
  updatedBy: string,
}

export interface UpdateTreatmentInterface {
  id: string,
  diagnosis: string,
  treatments: number[],
  updatedBy: string,
}
