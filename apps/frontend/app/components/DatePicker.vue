<script setup lang="ts">
import type { DateValue } from '@internationalized/date';
import { fromDate, getLocalTimeZone, today } from '@internationalized/date';
import { ChevronDownIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { PropType } from 'vue';

const outboundDate = defineModel({
  type: Object as PropType<Date>,
});

const date = ref() as Ref<DateValue | undefined>;

watch(date, (newVal) => {
  if (newVal) outboundDate.value = newVal.toDate(getLocalTimeZone());
});

watch(outboundDate, (newVal) => {
  if (newVal) return (date.value = fromDate(newVal, getLocalTimeZone()));
});

const open = ref(false);
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        id="date-picker"
        variant="outline"
        class="w-32 justify-between font-normal"
      >
        <ClientOnly>
          {{
            date
              ? date.toDate(getLocalTimeZone()).toLocaleDateString('TR-tr')
              : 'Tarih Seçiniz...'
          }}
        </ClientOnly>
        <ChevronDownIcon />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto overflow-hidden p-0" align="start">
      <Calendar
        :model-value="date"
        :max-value="today(getLocalTimeZone())"
        @update:model-value="
          (value) => {
            if (value) {
              date = value;
              open = false;
            }
          }
        "
      />
    </PopoverContent>
  </Popover>
</template>
