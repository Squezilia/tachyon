<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import FormScaffold from '@/components/FormScaffold.vue';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import formatPrice from '@/lib/formatPrice';
import { toast } from 'vue-sonner';
import type { FormType } from '~/components/resourceForms/StockForm.vue';

definePageMeta({
  middleware: ['auth'],
});

type ProductOption = { name: string; id: string; price: string };

const values = ref<FormType>({
  productId: '',
  minQuantity: 0,
  quantity: 0,
});

const products = ref<ProductOption[]>([]);

function onSubmit(values: FormType) {
  toast.promise<string>(
    new Promise((resolve, reject) =>
      useNuxtApp().$api('/v1/inventory/stocks/create', {
        method: 'POST',
        body: {
          quantity: values.quantity,
          minQuantity: values.minQuantity,
          maxQuantity: values.maxQuantity,
          lastRestockedAt: values.lastRestockedAt,
          productId: values.productId,
        },
        responseType: 'json',
        credentials: 'include',
        async onResponseError(context) {
          if (context.response.status >= 400) {
            const body = (await context.response._data) as {
              error: string;
              reason: string;
            };
            reject(body.error);
            if (context.response.status === 401) {
              useRouter().push('/login');
            }
            return;
          }
        },
        async onResponse(context) {
          if (context.response.status !== 201) return;
          resolve('Stok Oluşturuldu!');
          useRouter().push('/dash/inventory/stocks');
        },
      })
    ),
    {
      loading: 'Stok Oluşturuluyor...',
      success: (data: string) => data,
      error: (data: string) => data,
    }
  );
}

const selectedProduct = computed(() =>
  products.value.find((product) => product.id === values.value.productId)
);

onMounted(async () => {
  const productList = await useNuxtApp().$api(
    '/v1/inventory/products/get/raw',
    {
      credentials: 'include',
      async onRequestError(context) {
        if (!context.response) return;
        if (context.response.status >= 400 || context.response.status < 500) {
          const body = (await context.response.json()) as {
            error: string;
            reason: string;
          };

          toast(body.error, { description: body.reason });
        }
      },
    }
  );

  products.value = productList as ProductOption[];
});
</script>

<template>
  <div>
    <FormScaffold
      section="Envanter"
      title="Stok Oluştur"
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
            <ResourceFormsStockForm
              v-model:values="values"
              @submit="onSubmit"
            />
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
