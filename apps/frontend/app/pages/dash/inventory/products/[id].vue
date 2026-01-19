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
import { toast } from 'vue-sonner';
import formatPrice from '~/lib/formatPrice';
import type { FormType } from '~/components/resourceForms/ProductForm.vue';
import type { ErrorResponseSchema } from '@backend/model';
import type { ProductPlain } from '@database';

definePageMeta({
  middleware: ['auth'],
});

const values = ref<FormType>({
  name: '',
  categoryId: '',
  price: 0,
});
const categoryList = ref<{ name: string; id: string }[]>([]);
const id = useRoute().params.id;

function onSubmit(values: FormType) {
  toast.promise<string>(
    new Promise((resolve, reject) =>
      useApi(`/v1/inventory/products/update/${id}`, {
        method: 'PATCH',
        body: {
          name: values.name,
          price: '' + values.price,
          categoryId: values.categoryId,
        },
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
          if (context.response.status !== 200) return;
          resolve('Ürün Düzenlendi!');
          useRouter().push('/dash/inventory/products');
        },
      })
    ),
    {
      loading: 'Ürün Düzenleniyor...',
      success: (data: string) => data,
      error: (data: string) => data,
    }
  );
}

const namePreview = computed(() => values.value.name?.trim() || 'Yeni Ürün');
const categoryName = computed(
  () =>
    categoryList.value.find((item) => item.id === values.value.categoryId)?.name
);

onMounted(async () => {
  const fetchedList = await useApi<{ name: string; id: string }[]>(
    '/v1/inventory/categories/get/raw'
  ).catch((err: { error: string; reason: string }) => {
    toast(err.error, { description: err.reason });
    return;
  });

  if (!fetchedList || !fetchedList.data.value) return;

  categoryList.value = fetchedList.data.value;

  const fetchedValues = await useApi<typeof ProductPlain.static>(
    `/v1/inventory/products/get/${id}`,
    {
      onResponseError(context) {
        if (context.response.status >= 400) {
          const body = context.response
            ._data as typeof ErrorResponseSchema.static;
          toast(body.error, { description: body.reason });
        }
      },
    }
  );

  if (!fetchedValues.data.value) return;

  values.value = {
    name: fetchedValues.data.value.name,
    price: +fetchedValues.data.value.price,
    categoryId: fetchedValues.data.value.categoryId,
  };
});
</script>

<template>
  <div>
    <FormScaffold
      section="Envanter"
      title="Ürün Düzenle"
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
