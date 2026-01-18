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
import type { FormType } from '~/components/resourceForms/CategoryForm.vue';

definePageMeta({
  middleware: ['auth'],
});

const values = ref<FormType>({
  name: '',
});

function onSubmit(values: FormType) {
  toast.promise<string>(
    new Promise((resolve, reject) =>
      useNuxtApp().$api('/v1/inventory/categories/create', {
        method: 'POST',
        body: {
          name: values.name,
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
          resolve('Kategori Oluşturuldu!');
          useRouter().push('/dash/inventory/categories');
        },
      })
    ),
    {
      loading: 'Kategori Oluşturuluyor...',
      success: (data: string) => data,
      error: (data: string) => data,
    }
  );
}

const namePreview = computed(
  () => values.value.name?.trim() || 'Yeni Kategori'
);
</script>

<template>
  <div>
    <FormScaffold
      section="Envanter"
      title="Kategori Oluştur"
      description="Ürünleri gruplamak adına yeni bir kategori oluşturun."
      back-to="/dash/inventory/categories"
    >
      <template #main>
        <Card>
          <CardHeader>
            <CardTitle>Detaylar</CardTitle>
            <CardDescription>
              Kategoriniz için ayırt edilebilir ve genel bir isim verin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResourceFormsCategoryForm
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
              Kategorinin yönetim panelinde nasıl gözükeceğini görün.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div>
              <p class="text-xs uppercase text-muted-foreground">
                Kategori Adı
              </p>
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
