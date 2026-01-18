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

definePageMeta({
  middleware: ['auth'],
});

const values = ref<FormType>({
  name: '',
  categoryId: '',
  price: 0,
});

function onSubmit(values: FormType) {
  toast.promise<string>(
    new Promise((resolve, reject) =>
      useNuxtApp().$api('/v1/inventory/products/create', {
        method: 'POST',
        body: {
          name: values.name,
          price: '' + values.price,
          categoryId: values.categoryId,
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
          resolve('Ürün Oluşturuldu!');
          useRouter().push('/dash/inventory/products');
        },
      })
    ),
    {
      loading: 'Ürün Oluşturuluyor...',
      success: (data: string) => data,
      error: (data: string) => data,
    }
  );
}

const namePreview = computed(() => values.value.name?.trim() || 'Yeni Ürün');
const categoryName = computed(
  () => categoryList.find((item) => item.id === values.value.categoryId)?.name
);

const categoryList = (await useNuxtApp()
  .$api('/v1/inventory/categories/get/raw', {
    credentials: 'include',
  })
  .catch((err: { error: string; reason: string }) => {
    toast(err.error, { description: err.reason });
  })) as { name: string; id: string }[];
</script>

<template>
  <div>
    <FormScaffold
      section="Envanter"
      title="Ürün Oluştur"
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
            <ResourceFormsProductForm
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
