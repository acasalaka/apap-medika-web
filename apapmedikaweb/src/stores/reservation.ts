import { defineStore } from 'pinia';
import type { ReservationInterface, ReservationRequestInterface, UpdateReservationRequestInterface } from '@/interface/reservation.interface';
import { useToast } from 'vue-toastification';
import router from "@/router";
import type { CommonResponseInterface } from '@/interface/common.interface';
import type { Update } from 'vite/types/hmrPayload.js';

export const useReservationStore = defineStore('reservation', {
    state: () => ({
        reservations: [] as ReservationInterface[],
        loading: false,
        error: null as null | string,
    }),

    actions: {
        async getReservations() {
            this.loading = true;
            this.error = null;

            try {
                const response = await fetch('http://localhost:8083/api/reservations');
                const data: CommonResponseInterface<ReservationInterface[]> = await response.json();
                this.reservations = data.data;
                console.log(this.reservations)
            } catch (err) {
                this.error = `Gagal mengambil reservation. ${err}`;
            } finally {
                this.loading = false;
            }
        },

        async addReservation(body: ReservationRequestInterface) {
            this.loading = true;
            this.error = null;

            try {
                const response = await fetch('http://localhost:8083/api/reservations/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                })

                const data: CommonResponseInterface<ReservationInterface> = await response.json()
                console.log("isi data" + data)
                this.reservations.push(data.data)

                useToast().success("Sukses menambahkan reservation")
                await router.push("/reservation")
                console.log("test2")
            } catch (err) {
                this.error = `Gagal menambah reservation ${(err as Error).message}`
                useToast().error(this.error)
            } finally {
                this.loading = false
            }
        },

        async updateReservation(id: string, body: UpdateReservationRequestInterface) {
            this.loading = true;
            this.error = null;

            try {
                const response = await fetch(
                    `http://localhost:8083/api/reservations/${id}/update`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to update project");
                  }

                const data: CommonResponseInterface<ReservationInterface> = await response.json();
                const index = this.reservations.findIndex((reservation) => reservation.id === id);
                if (index !== -1) {
                    this.reservations[index] = data.data;
                }
                useToast().success("Sukses mengubah reservation");
                await router.push("/reservation");
            } catch (err) {
                this.error = `Gagal mengubah reservation. ${err}`;
                useToast().error(this.error);
            } finally {
                this.loading = false;
            }
        },

        async getReservationDetail(id: string): Promise< ReservationInterface | undefined > {
            this.loading = true;
            this.error = null;

            try {
                const response = await fetch(`http://localhost:8083/api/reservations/${id}`);
                const data: CommonResponseInterface<ReservationInterface> = await response.json();
                return data.data;
            } catch (err) {
                this.error = `Gagal mengambil detail reservation. ${err}`;
            } finally {
                this.loading = false;
            }
        },

        async deleteReservation(id: string) {
            this.loading = true;
            this.error = null;

            try {
                const response = await fetch(`http://localhost:8083/api/reservations/${id}/delete`, {
                    method: 'DELETE',
                });

                const data: CommonResponseInterface<ReservationInterface> = await response.json();
                this.reservations = this.reservations.filter((reservation) => reservation.id !== id);

                useToast().success("Sukses menghapus reservation");
            } catch (err) {
                this.error = `Gagal menghapus reservation. ${err}`;
                useToast().error(this.error);
            } finally {
                this.loading = false;
            }
        }
    },
});