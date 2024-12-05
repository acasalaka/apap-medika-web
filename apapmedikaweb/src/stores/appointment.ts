import { defineStore } from 'pinia';
import type { AppointmentInterface, AppointmentRequestInterface, UpdateTreatmentInterface } from '@/interface/appointment.interface';
import { useToast } from 'vue-toastification';
import router from "@/router";
import type { CommonResponseInterface } from "@/interface/common.interface";
import type { UpdateStatusInterface } from "@/interface/appointment.interface";

export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
    appointments: [] as AppointmentInterface[],
    loading: false,
    error: null as null | string,
    role: '',
    userId: ''
  }),
    actions: {
      decodeJWT(token: string) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          return decoded.sub;
        } catch (error) {
          console.error('Failed to decode JWT:', error);
          return null;
        }
      },

      async fetchUserByEmail(email: string) {
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

      async getAppointments() {
        this.loading = true;
        this.error = null;

        try {
          const token = localStorage.getItem('authToken');
          const email = this.decodeJWT(token || '');
          await this.fetchUserByEmail(email);

          if (this.userId) {
            if (this.role === 'ADMIN' || this.role === 'NURSE') {
              const response = await fetch(`http://localhost:8081/api/appointment/viewall`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                  'Content-Type': 'application/json',
                },
              });
              if (!response.ok) {
                const errorMsg = `Failed to fetch appointments. Status: ${response.status}`;
                this.error = errorMsg;
                useToast().error(this.error);
                return;
              }
              const data: CommonResponseInterface<AppointmentInterface[]> = await response.json();
              if (!data || !data.data) {
                this.error = 'No appointments found or invalid response format.';
                useToast().error(this.error);
                return;
              }
              this.appointments = data.data;
              console.log("fetch data ADMIN dan NURSE");
              } else if (this.role === 'DOCTOR')  {
                const response = await fetch(`http://localhost:8081/api/appointment/by-doctor?idDoctor=${this.userId}`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                  },
                });
                if (response.status === 404) {
                  const errorMsg = `Dokter dengan ID ${this.userId} tidak memiliki Appointments` ;
                  this.error = errorMsg;
                  useToast().error(this.error);
                  return;
                }
                const data: CommonResponseInterface<AppointmentInterface[]> = await response.json();

                if (!data || !data.data) {
                  this.error = 'No appointments found or invalid response format.';
                  useToast().error(this.error);
                  return;
                }

                this.appointments = data.data;
                console.log("fetch data doctor")
            } else if (this.role === 'PATIENT')  {
              const response = await fetch(`http://localhost:8081/api/appointment/by-patient?idPatient=${this.userId}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                  'Content-Type': 'application/json',
                },
              });
              if (response.status === 404) {
                const errorMsg = `Patient dengan ID ${this.userId} tidak memiliki Appointments` ;
                this.error = errorMsg;
                useToast().error(this.error);
                return;
              }
              const data: CommonResponseInterface<AppointmentInterface[]> = await response.json();

              if (!data || !data.data) {
                this.error = 'No appointments found or invalid response format.';
                useToast().error(this.error);
                return;
              }

              this.appointments = data.data;
              console.log("fetch data PATIENT")
            }
          } else {
            useToast().error('User ID not found.');
          }
        } catch (err) {
          this.error = `Failed to fetch appointments. ${err}`;
          useToast().error(this.error);
        } finally {
          this.loading = false;
        }
      },

    async addAppointment(body: AppointmentRequestInterface) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('http://localhost:8081/api/appointment/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify(body),
        })

        const data: CommonResponseInterface<AppointmentInterface> = await response.json()
        if(response.ok) {
          this.appointments.push(data.data)
          useToast().success("Sukses menambahkan appointment")
        }
        else {
          useToast().error(data.message)
        }

        await router.push("/appointment")
      } catch (err) {
        this.error = `Gagal menambah appointment ${(err as Error).message}`
        useToast().error(this.error)
      } finally {
        this.loading = false
      }
    },

    async updateAppointmentStatus(id: string, body: UpdateStatusInterface) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(
          'http://localhost:8081/api/appointment/update-status',
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },

            body: JSON.stringify(body),
          }
        );
        const data: CommonResponseInterface<UpdateStatusInterface> = await response.json();

        if (response.ok) {
          const index = this.appointments.findIndex((appointment) => appointment.id === body.id);
          if (index !== -1) {
            this.appointments[index].status = body.status;
          }

          useToast().success("Sukses mengubah status appointment");
          window.location.reload();
        } else {
          useToast().error(data.message || "Gagal mengubah status appointment");
          console.log(data.message);
        }
      } catch (err) {
        this.error = `Gagal mengubah status appointment. ${(err as Error).message}`;
        useToast().error(this.error);
        console.log(this.error);
      } finally {
        this.loading = false;
      }
    },

    async updateAppointmentTreatment(id: string, body: UpdateTreatmentInterface) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(
          'http://localhost:8081/api/appointment/update-treatments',
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(body),
          }
        );

        const data: CommonResponseInterface<UpdateTreatmentInterface> = await response.json();

        if (response.ok) {
          const index = this.appointments.findIndex((appointment) => appointment.id === body.id);
          if (index !== -1) {
            this.appointments[index].status = body.status;
          }

          useToast().success("Sukses mengubah treatment dan diagnosis appointment");
          window.location.reload();
        } else {
          useToast().error(data.message || "Gagal mengubah treatment dan diagnosis appointment");
          console.log(data.message);
        }
      } catch (err) {
        this.error = `Gagal mengubah treatment dan diagnosis appointment. ${(err as Error).message}`;
        useToast().error(this.error);
        console.log(this.error);
      } finally {
        this.loading = false;
      }
    },

    async getAppointmentDetail(id: string): Promise<AppointmentInterface | undefined> {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`http://localhost:8081/api/appointment?id=${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          },
        });
        const data: CommonResponseInterface<AppointmentInterface> = await response.json();
        return data.data;
      } catch (err) {
        this.error = `Gagal mengambil appointment ${err}`;
      } finally {
        this.loading = false;
      }
    },

      async deleteAppointment(id: string): Promise<void> {
        this.loading = true;
        this.error = null;

        try {
          const authToken = localStorage.getItem('authToken');  // Menyimpan token ke dalam variabel authToken
          console.log(authToken);  // Cek token yang disimpan

          const response: Response = await fetch(
            `http://localhost:8081/api/appointment/${id}/delete`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,  // Gunakan authToken yang sudah disimpan
              },
            }
          );

          if (response.ok) {
            this.appointments = this.appointments.filter(
              (appointment: AppointmentInterface) => appointment.id !== id
            );

            await router.push("/appointment");
            useToast().success("Sukses menghapus appointment");
          } else {
            // Tangani jika response bukan OK
            this.error = "Gagal menghapus appointment, server error.";
            useToast().error(this.error);
          }
        } catch (err) {
          this.error = `Gagal menghapus appointment ${(err as Error).message}`;
          useToast().error(this.error);
        } finally {
          this.loading = false;
        }
      }
  }
});
