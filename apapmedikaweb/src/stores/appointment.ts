import { defineStore } from 'pinia';
import type { AppointmentInterface, AppointmentRequestInterface, UpdateTreatmentInterface } from '@/interface/appointment.interface';
import { useToast } from 'vue-toastification';
import router from "@/router";
import type {CommonResponseInterface} from "@/interface/common.interface";
import type {UpdateStatusInterface} from "@/interface/appointment.interface";

export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
    appointments: [] as AppointmentInterface[],
    loading: false,
    error: null as null | string,
  }),
  actions: {
    async getAppointments() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('http://localhost:8081/api/appointment/viewall');
        const data: CommonResponseInterface<AppointmentInterface[]> = await response.json();
        this.appointments = data.data;
        console.log(this.appointments)
      } catch (err) {
        this.error = `Gagal mengambil appointment. ${err}`;
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
          headers: { 'Content-Type': 'application/json' },
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
            headers: { 'Content-Type': 'application/json' },
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
            headers: { 'Content-Type': 'application/json' },
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
        const response: Response = await fetch(`http://localhost:8081/api/appointment?id=${id}`);
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
        const response: Response = await fetch(
          `http://localhost:8081/api/appointment/${id}/delete`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (response.ok) {
          this.appointments = this.appointments.filter(
            (appointment: AppointmentInterface) => appointment.id !== id
          );

          useToast().success("Sukses menghapus appointment");
          await router.push("/appointment");
        }
      } catch (err) {
        this.error = `Gagal menghapus appointment ${(err as Error).message}`;
        useToast().error(this.error)
      } finally {
        this.loading = false;
      }
    }
  }
});
