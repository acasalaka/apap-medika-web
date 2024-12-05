import { defineStore } from 'pinia';
import type { BillInterface, UpdateStatusInterface } from '@/interface/bill.interface';
import { useToast } from 'vue-toastification';
import router from "@/router";
import type { CommonResponseInterface } from '@/interface/common.interface';

export const useBillStore = defineStore('bill', {
    state: () => ({
        bills: [] as BillInterface[],
        loading: false,
        error: null as null | string,
    }),
    actions: {
        async getBill() {
            this.loading = true;
            this.error = null;
            try {
                const response = await fetch('http://localhost:8085/api/bill/viewall');
                const data: CommonResponseInterface<BillInterface[]> = await response.json();
                this.bills = data.data;
                console.log(this.bills);
            } catch (err) {
                this.error = `Gagal mengambil bill. ${err}`;
            } finally {
                this.loading = false;
            }
        },

        async getBillDetail(id: string): Promise<BillInterface | undefined> {
            this.loading = true
            this.error = null
          
            try {
              const response: Response = await fetch(`http://localhost:8085/api/bill/detail/${id}`)
              const data: CommonResponseInterface<BillInterface> = await response.json()
              return data.data
            } catch (err) {
              this.error = `Gagal mengambil proyek ${err}`
            } finally {
              this.loading = false
            }
          },

          async payBill(id: string, body: UpdateStatusInterface) {
            this.loading = true
            this.error = null

            try{
              const response : Response = await fetch(`http://localhost:8085/api/bill/${id}/update`,
                {
                  method : 'PUT',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(body),
                }
              );

              if (!response.ok) {
                throw new Error('Gagal membayar bill')
              }

              const data: CommonResponseInterface<BillInterface> = await response.json()
              const dataIndex = this.bills.findIndex((bill) => bill.id === id)
              if (dataIndex !== -1) {
                this.bills[dataIndex] = data.data
              }

            }catch(err){
              this.error = `Gagal membayar bill ${err}`
            }finally{
              this.loading = false
            }
          },
          

          
    }
});