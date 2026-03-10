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
import type { ErrorResponseSchema } from '@backend/model';
import type { ProductPlain } from '@database';

definePageMeta({
  middleware: ['auth'],
});

const { $api } = useNuxtApp();

const values = ref<FormType>({
  name: '',
});
const id = useRoute().params.id;

function onSubmit(values: FormType) {
  useToastFetch(`/v1/pos/tables/update/${id}`, {
    fetchOptions: {
      method: 'PATCH',
      body: {
        name: values.name,
      },
    },
    toastOptions: {
      success: 'Masa Düzenlendi!',
      loading: 'Masa Düzenleniyor...',
      callback: '/dash/pos/tables',
    },
  });
}

const namePreview = computed(() => values.value.name?.trim() || 'Yeni Masa');

onMounted(async () => {
  const fetchedValues = await $api<typeof ProductPlain.static>(
    `/v1/pos/tables/get/${id}`,
    {
      cache: 'no-cache',
      onResponseError({ response }) {
        if (response.ok) return;
        const body = response._data as typeof ErrorResponseSchema.static;
        useToast(body.error, { description: body.reason, type: 'error' });
      },
    }
  );

  if (!fetchedValues) return;

  values.value = {
    name: fetchedValues.name,
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
