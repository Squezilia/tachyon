<script setup lang="ts">
import { computed, ref } from 'vue';
import FormScaffold from '@/components/FormScaffold.vue';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import formatPrice from '@/lib/formatPrice';
import type { FormType } from '~/components/resourceForms/StockForm.vue';
import type { ProductRaw } from '@backend/routes/v1/inventory/products/model';
import client from '~/lib/api';

definePageMeta({
  middleware: ['auth'],
});

const values = ref<FormType>({
  productId: '',
  minQuantity: 0,
  quantity: 0,
});

const products = ref<(typeof ProductRaw.static)[]>([]);

async function onSubmit(values: FormType) {
  if (!values.quantity || !values.minQuantity || !values.productId) return;

  const res = await client.v1.inventory.stocks
    .post({
      quantity: values.quantity,
      minQuantity: values.minQuantity,
      maxQuantity: values.maxQuantity,
      lastRestockedAt: values.lastRestockedAt,
      productId: values.productId,
    })
    .catch(useClientError);
  if (!res) return;

  useToast('Stok Oluşturuldu!', { type: 'success' });
}

onMounted(async () => {
  const res = await client.v1.inventory.products.raw
    .get()
    .catch(useClientError);
  if (!res || !res.data) return;
  products.value = res.data;
});

const selectedProduct = computed(() => {
  if (!products.value || !Array.isArray(products.value)) return;
  return products.value.find(
    (product) => product.id === values.value.productId
  );
});
</script>

<template>
  <div>
    <FormScaffold
      title="Yeni Stok"
      description="Belirli bir ürün için konum ve miktar belirtin."
      back-to="/dash/inventory/stocks"
    >
      <template #main>
        <Card>
          <CardHeader>
            <CardTitle>Detaylar</CardTitle>
            <CardDescription>
              Stoğun ne kadar ve nerede olduğunu belirtin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResourceFormsStockForm v-model="values" @submit="onSubmit" />
          </CardContent>
        </Card>
      </template>

      <template #aside>
        <Card class="border-dashed">
          <CardHeader>
            <CardTitle>Önizleme</CardTitle>
            <CardDescription>
              Ayarladığınız değelerin nasıl göründüğünü görün.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div
              v-if="selectedProduct"
              class="flex items-start justify-between"
            >
              <div>
                <p class="text-xs uppercase text-muted-foreground">Ürün</p>
                <p class="text-lg font-semibold">
                  {{ selectedProduct?.name ?? 'Ürün seçilmedi' }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ formatPrice(selectedProduct?.price, 'TRY', 'tr-TR') }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs uppercase text-muted-foreground">Miktar</p>
                <p class="text-2xl font-semibold">
                  {{ values.quantity || '0' }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="rounded-lg border bg-muted/30 p-2">
                <p class="text-xs uppercase text-muted-foreground">Minimum</p>
                <p class="font-semibold">
                  {{ values.minQuantity || '—' }}
                </p>
              </div>
              <div class="rounded-lg border bg-muted/30 p-2">
                <p class="text-xs uppercase text-muted-foreground">Maksimum</p>
                <p class="font-semibold">
                  {{ values.maxQuantity || '—' }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </template>
    </FormScaffold>
  </div>
</template>
