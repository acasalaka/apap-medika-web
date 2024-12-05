import type { ReservationInterface } from "./reservation.interface";

export interface RoomInterface {
    id: string,
    name: string,
    description: string,
    maxCapacity: number,
    price: number,
    createdAt: Date,
    updatedAt: Date,
    reservations: ReservationInterface[],
}

export interface RoomOptionInterface {
    id : string,
    name : string,
}