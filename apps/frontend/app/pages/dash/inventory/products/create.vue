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
import type { CategoryRaw } from '@backend/routes/v1/inventory/categories/model';
import client from '~/lib/api';
import useClientError from '~/composables/useClientError';
import useToast from '~/composables/useToast';
import ProductForm from '~/components/resourceForms/ProductForm.vue';

definePageMeta({
  middleware: ['auth'],
});

const values = ref<FormType>({
  name: '',
  categoryId: '',
  price: 0,
});

const categoryList = ref<(typeof CategoryRaw.static)[]>([]);

async function onSubmit(values: FormType) {
  if (!values.name || !values.price || !values.categoryId) return;

  const res = await client.v1.inventory.products
    .post({
      name: values.name,
      price: '' + values.price,
      categoryId: values.categoryId,
    })
    .catch(useClientError);

  if (!res) return;

  useToast('Ürün Oluşturuldu!', { type: 'success' });
}

onMounted(async () => {
  const listRes = await client.v1.inventory.categories.raw
    .get()
    .catch(useClientError);
  if (!listRes || !listRes.data) return;

  categoryList.value = listRes.data;
});

const namePreview = computed(() => values.value.name?.trim() || 'Yeni Ürün');
const categoryName = computed(() => {
  if (!categoryList.value || !Array.isArray(categoryList.value)) return;
  return categoryList.value.find((item) => item.id === values.value.categoryId)
    ?.name;
});
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
            <ProductForm v-model="values" @submit="onSubmit" />
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
