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
import type { FormType } from '~/components/resourceForms/TableForm.vue';
import client from '~/lib/api';

definePageMeta({
  middleware: ['auth'],
});

const values = ref<FormType>({
  name: '',
});
const id = useRoute().params.id + '';

async function onSubmit(values: FormType) {
  const res = await client.v1.pos.gastro
    .tables({ id })
    .patch({ name: values.name })
    .catch(useClientError);
  if (!res) return;
  useToast('Masa Düzenlendi!', { type: 'success' });
}

const namePreview = computed(() => values.value.name?.trim() || 'Yeni Masa');

onMounted(async () => {
  const valuesRes = await client.v1.pos.gastro
    .tables({ id })
    .get()
    .catch(useClientError);
  if (!valuesRes || !valuesRes.data) return;

  values.value = {
    name: valuesRes.data.name,
  };
});
</script>

<template>
  <div>
    <FormScaffold title="Masa Düzenle" back-to="/dash/pos/tables">
      <template #main>
        <Card>
          <CardHeader>
            <CardTitle>Detaylar</CardTitle>
            <CardDescription>
              Bu ürün için isim, fiyat ve kategori gibi değerleri ayarlayın.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResourceFormsTableForm v-model="values" @submit="onSubmit" />
          </CardContent>
        </Card>
      </template>

      <template #aside>
        <Card class="border-dashed">
          <CardHeader>
            <CardTitle>Önizleme</CardTitle>
            <CardDescription>
              Masanın yönetim panelinde nasıl gözükeceğini görün.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div>
              <p class="text-xs uppercase text-muted-foreground">Ürün Adı</p>
              <p class="text-xl font-semibold">
                {{ namePreview }}
              </p>
            </div>
          </CardContent>
        </Card>
      </template>
    </FormScaffold>
  </div>
</template>
