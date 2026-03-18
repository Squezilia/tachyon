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
import formatPrice from '~/lib/formatPrice';
import type { FormType } from '~/components/resourceForms/ProductForm.vue';
import type { ErrorResponseSchema } from '@backend/model';
import type { ProductPlain } from '@database/prismabox';

definePageMeta({
  middleware: ['auth'],
});

const { $api } = useNuxtApp();

const values = ref<FormType>({
  name: '',
  categoryId: '',
  price: 0,
});
const categoryList = ref<{ name: string; id: string }[]>([]);
const id = useRoute().params.id;

function onSubmit(values: FormType) {
  useToastFetch(`/v1/inventory/products/update/${id}`, {
    fetchOptions: {
      method: 'PATCH',
      body: {
        name: values.name,
        price: '' + values.price,
        categoryId: values.categoryId,
      },
    },
    toastOptions: {
      success: 'Ürün Düzenlendi!',
      loading: 'Ürün Düzenleniyor...',
      callback: '/dash/inventory/products',
    },
  });
}

const namePreview = computed(() => values.value.name?.trim() || 'Yeni Ürün');
const categoryName = computed(
  () =>
    categoryList.value.find((item) => item.id === values.value.categoryId)?.name
);

onMounted(async () => {
  const fetchedList = await $api<{ name: string; id: string }[]>(
    '/v1/inventory/categories/get/raw',
    { cache: 'no-cache' }
  ).catch((err: typeof ErrorResponseSchema.static) => {
    useToast(err.error, { description: err.reason, type: 'error' });
    return;
  });

  if (!fetchedList) return;

  categoryList.value = fetchedList;

  const fetchedValues = await $api<typeof ProductPlain.static>(
    `/v1/inventory/products/get/${id}`,
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
    price: +fetchedValues.price,
    categoryId: fetchedValues.categoryId,
  };
});
</script>

<template>
  <div>
    <FormScaffold title="Ürün Düzenle" back-to="/dash/inventory/products">
      <template #main>
        <Card>
          <CardHeader>
            <CardTitle>Detaylar</CardTitle>
            <CardDescription>
              Bu ürün için isim, fiyat ve kategori gibi değerleri ayarlayın.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResourceFormsProductForm v-model="values" @submit="onSubmit" />
          </CardContent>
        </Card>
      </template>

      <template #aside>
        <Card class="border-dashed">
          <CardHeader>
            <CardTitle>Önizleme</CardTitle>
            <CardDescription>
              Ürünün yönetim panelinde nasıl gözükeceğini görün.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div>
              <p class="text-xs uppercase text-muted-foreground">Ürün Adı</p>
              <p class="text-xl font-semibold">
                {{ namePreview }}
              </p>
              <p class="mt-.5 mb-1 text-sm">
                {{ categoryName || 'Seçili Kategori' }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase text-muted-foreground">Fiyat</p>
              <p>{{ formatPrice(values.price || 0, 'TRY', 'TR-tr') }}</p>
            </div>
          </CardContent>
        </Card>
      </template>
    </FormScaffold>
  </div>
</template>
