import type { DoctorInterface } from '@/interface/doctor.interface';
import type { PatientInterface } from '@/interface/patient.interface';

export interface AppointmentInterface {
  id: string;
  doctorName: doctorInterface;
  patientName: patientInterface;
  date: Date;
  diagnosis: string;
  treatments: string[];
  totalFee: number;
  status: number;
}

export interface AppointmentRequestInterface {
  nik: string,
  doctorId: string,
  date: Date,
}

export interface UpdateStatusInterface {
  idDoctor: string,
  idPatient: string,
  date: Date,
}

export interface UpdateTreatmentInterface {
  idDoctor: string,
  idPatient: string,
  date: Date,
}
