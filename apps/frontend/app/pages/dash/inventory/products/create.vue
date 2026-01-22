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

definePageMeta({
  middleware: ['auth'],
});

type CategoryOption = { name: string; id: string }[];

const values = ref<FormType>({
  name: '',
  categoryId: '',
  price: 0,
});

const categoryList = await useApi<CategoryOption>(
  '/v1/inventory/categories/get/raw',
  {
    cache: 'no-cache',
    async onResponseError({ response }) {
      if (response.ok) return;
      const body = response._data as typeof ErrorResponseSchema.static;
      useToast(body.error, { type: 'error' });
    },
  }
);

function onSubmit(values: FormType) {
  useToastFetch('/v1/inventory/products/create', {
    fetchOptions: {
      method: 'POST',
      body: {
        name: values.name,
        price: '' + values.price,
        categoryId: values.categoryId,
      },
    },
    toastOptions: {
      success: 'Ürün Oluşturuldu!',
      loading: 'Ürün Oluşturuluyor...',
      callback: '/dash/inventory/products',
    },
  });
}

const namePreview = computed(() => values.value.name?.trim() || 'Yeni Ürün');
const categoryName = computed(
  () =>
    categoryList.data.value?.find((item) => item.id === values.value.categoryId)
      ?.name
);
</script>

<template>
  <div>
    <FormScaffold
      title="Yeni Ürün"
      description="Bir kategori altında yeni bir ürün oluşturun."
      back-to="/dash/inventory/products"
    >
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
