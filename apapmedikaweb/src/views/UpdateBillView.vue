<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useBillStore } from '@/stores/bill';
import type { BillInterface } from '@/interface/bill.interface';

const route = useRoute()
const { id: billId } = route.params

const billStore = useBillStore()

const billModel = reactive({
  
})


</script>