import { defineStore } from 'pinia';
import type { ReservationInterface, ReservationRequestInterface } from '@/interface/reservation.interface';
import { useToast } from 'vue-toastification';
import router from "@/router";
import type { CommonResponseInterface } from '@/interface/common.interface';
import type { RoomInterface } from '@/interface/room.interface';

export const useRoomStore = defineStore('room', {
    state: () => ({
        rooms: [] as RoomInterface[],
        loading: false,
        error: null as null | string,
    }),
    
    actions: {
        async getRooms() {
            
        },
    }
})