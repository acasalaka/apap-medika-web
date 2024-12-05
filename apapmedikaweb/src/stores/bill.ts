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
      
        async getBill() {
            this.loading = true;
            this.error = null;
            try {
                  const response = await fetch(`http://localhost:8085/api/bill/viewall`,{
                  method : 'GET',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                  }
                });
                if (!response.ok) {
                  const errorMsg = `Failed to fetch Bill. Status: ${response.status}`;
                  this.error = errorMsg;
                  useToast().error(errorMsg);
                  return
                }
                const data: CommonResponseInterface<BillInterface[]> = await response.json();
                this.bills = data.data;
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
              const response: Response = await fetch(`http://localhost:8085/api/bill/detail/${id}`,{
                method : 'GET',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                      'Content-Type': 'application/json',
                    }
              })
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
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
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