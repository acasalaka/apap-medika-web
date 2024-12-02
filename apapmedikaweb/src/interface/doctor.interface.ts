export interface DoctorInterface {
  id: string,
  name: string,
  username: string,
  password: string,
  email: string,
  gender: string,
  specialist: string,
  yearsOfExperience: number,
  fee: number,
  schedules: number[],
  createdAt: Date,
  updatedAt: Date,
  isDeleted: boolean,
}

export interface DoctorOptionInterface {
  id: string,
  name: string,
}

export interface DoctorScheduleInterface {
  schedules: string[],
}
