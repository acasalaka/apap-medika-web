import { defineStore } from 'pinia';
import type { ReservationInterface, ReservationRequestInterface, UpdateReservationRequestInterface } from '@/interface/reservation.interface';
import { useToast } from 'vue-toastification';
import router from "@/router";
import type { CommonResponseInterface } from '@/interface/common.interface';
import type { Update } from 'vite/types/hmrPayload.js';
import { de } from 'date-fns/locale';

export const useReservationStore = defineStore('reservation', {
    state: () => ({
        reservations: [] as ReservationInterface[],
        loading: false,
        error: null as null | string,
        role: '',
        userId: ''
    }),

    actions: {
        decodeJWT(token: string){
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                return decoded.sub;
            } catch (error) {
                console.error('Failed to decode JWT:', error);
                return null;
            }
        },
        async fetchUserByEmail(email: string){
            try {
                const response = await fetch(`http://localhost:8084/api/user/detail/${email}`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                  },
                });
      
                if (response.ok) {
                  const data = await response.json();
                  this.userId = data.data.id;
                  this.role = data.data.role;
                  console.log(this.role);
                  console.log(this.userId);
                } else {
                  useToast().error('Failed to fetch user data.');
                }
              } catch (err) {
                useToast().error(`Error: ${err.message}`);
              }
        },
        async getReservations() {
            this.loading = true;
            this.error = null;

            try {
                const token = localStorage.getItem('authToken');
                const email = this.decodeJWT(token || '');
                await this.fetchUserByEmail
                if (this.userId){
                    if(this.role === 'ADMIN'){
                        const response = await fetch('http://localhost:8083/api/reservations',{
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                                },
                        });
                        const data: CommonResponseInterface<ReservationInterface[]> = await response.json();
                        this.reservations = data.data;
                    }
                    if(this.role === 'PATIENT'){
                        const response = await fetch(`http://localhost:8083/api/reservations/patient/${this.userId}`,{
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                                'Content-Type': 'application/json',
                                },
                        });
                        const data: CommonResponseInterface<ReservationInterface[]> = await response.json();
                        this.reservations = data.data;
                    }
                    if(this.role === 'NURSE'){
                        const response = await fetch(`http://localhost:8083/api/reservations/nurse/${this.userId}`,{
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                                'Content-Type': 'application/json',
                                },
                        });
                        const data: CommonResponseInterface<ReservationInterface[]> = await response.json();
                        this.reservations = data.data;
                    }                   
                }
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
                    headers: {
                        'Content-Type': 'application/json' ,
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    },
                    body: JSON.stringify(body),
                });
                const data: CommonResponseInterface<ReservationInterface> = await response.json()
                if (response.ok) {
                this.reservations.push(data.data)
                useToast().success("Sukses menambahkan reservation")
                
                }
                else{
                    useToast().error(data.message)
                }
                await router.push("/reservation")
                } catch (err) {
                this.error = `Failed to add reservation. ${err}`
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
                        headers: { 'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        },
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
                const token = localStorage.getItem('authToken');
                const email = this.decodeJWT(token || '');
                await this.fetchUserByEmail(email);
                if (this.userId){
                    if (this.role === 'ADMIN' || this.role === 'NURSE' || this.role === 'PATIENT'){
                        const response = await fetch(`http://localhost:8083/api/reservations/${id}`,{
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                                    'Content-Type': 'application/json',
                                },
                            } );
                            const data: CommonResponseInterface<ReservationInterface> = await response.json();
                            return data.data;
                            }
                        }
                } catch (err) {
                    this.error = `Gagal mengambil detail reservation. ${err}`;
                }finally {
                    this.loading = false;
                }
                },

        async deleteReservation(id: string) {
            this.loading = true;
            this.error = null;

            try {
                const token = localStorage.getItem('authToken');
                const email = this.decodeJWT(token || '');
                await this.fetchUserByEmail(email);
                if(this.userId){
                    if(this.role === 'ADMIN' || this.role === 'NURSE'){
                        const response = await fetch(`http://localhost:8083/api/reservations/${id}/delete`,{
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                                'Content-Type': 'application/json',
                              },
                            });
                            const data: CommonResponseInterface<ReservationInterface> = await response.json();
                            this.reservations = this.reservations.filter((reservation) => reservation.id !== id);
                            useToast().success("Sukses menghapus reservation");
                        }
                    }
                } catch (err) {
                    this.error = `Gagal menghapus reservation. ${err}`;
                    useToast().error(this.error);
                } finally {
                    this.loading = false;
                }
        }
    },
});