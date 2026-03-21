<script setup lang="ts">
import { computed } from 'vue';
import FormScaffold from '@/components/FormScaffold.vue';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import formatPrice from '@/lib/formatPrice';
import type { FormType } from '~/components/resourceForms/TaxForm.vue';
import client from '~/lib/api';

definePageMeta({
  middleware: ['auth'],
});

const values = ref<FormType>({
  name: '',
  isCumulative: false,
  isFixed: false,
  priority: 0,
  rate: 0,
});
const locale = Intl.DateTimeFormat().resolvedOptions().locale;

async function onSubmit(values: FormType) {
  if (!values.name || !values.priority) return;

  const res = await client.v1.management.taxes
    .post({
      name: values.name,
      priority: values.priority,
      rate: values.rate + '',
      isFixed: values.isFixed,
      isCumulative: values.isCumulative,
    })
    .catch(useClientError);
  if (!res) return;

  useToast('Vergi Oluşturuldu!', { type: 'success' });
}

const namePreview = computed(() => values.value.name?.trim() || 'Yeni Vergi');

const formattedRate = computed(() => {
  const rateNumber = Number(values.value.rate);
  if (Number.isNaN(rateNumber) || rateNumber <= 0) return '—';
  return values.value.isFixed
    ? formatPrice(rateNumber, 'TRY', locale)
    : `${rateNumber}%`;
});
</script>

<template>
  <div>
    <FormScaffold
      title="Yeni Vergi"
      description="Matrah tipi, vergi stili, vergi adı ve değeri gibi verileri ayarlayarak vergi oluşturun."
      back-to="/dash/management/taxes"
    >
      <template #main>
        <Card>
          <CardHeader>
            <CardTitle>Detaylar</CardTitle>
            <CardDescription>
              Verginin nasıl davranacağını ayarlayın.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResourceFormsTaxForm v-model="values" @submit="onSubmit" />
          </CardContent>
        </Card>
      </template>

      <template #aside>
        <Card class="border-dashed">
          <CardHeader>
            <CardTitle>Önizleme</CardTitle>
            <CardDescription>
              Vergi davranışının nasıl gerçekleşceğini görün.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs uppercase text-muted-foreground">Vergi Adı</p>
                <p class="text-xl font-semibold">
                  {{ namePreview }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs uppercase text-muted-foreground">Önem</p>
                <p class="text-lg font-semibold">
                  {{ values.priority || '0' }}
                </p>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs uppercase text-muted-foreground">Değer</p>
                <p class="text-lg font-semibold">{{ formattedRate }}</p>
              </div>
              <div class="text-right space-y-1 text-xs text-muted-foreground">
                <p>
                  Mod:
                  <span class="font-medium text-foreground">
                    {{ values.isFixed ? 'Sabit' : 'Yüzdelik' }}
                  </span>
                </p>
                <p>
                  {{ values.isCumulative ? 'Kümulatif' : 'Kümulatif Değil' }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </template>
    </FormScaffold>
  </div>
</template>
