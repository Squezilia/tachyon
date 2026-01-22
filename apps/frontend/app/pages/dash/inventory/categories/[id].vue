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
import type { FormType } from '~/components/resourceForms/CategoryForm.vue';
import type { ErrorResponseSchema } from '@backend/model';
import type { CategoryPlain } from '@database';

definePageMeta({
  middleware: ['auth'],
});

const { $api } = useNuxtApp();

const values = ref<FormType>({
  name: '',
});
const id = useRoute().params.id;

function onSubmit(values: FormType) {
  useToastFetch(`/v1/inventory/categories/update/${id}`, {
    fetchOptions: {
      method: 'PATCH',
      body: {
        name: values.name,
      },
    },
    toastOptions: {
      loading: 'Kategori Oluşturuluyor...',
      success: 'Kategori Oluşturuldu!',
      callback: '/dash/inventory/categories',
    },
  });
}

onMounted(async () => {
  const fetchedValues = await $api<typeof CategoryPlain.static>(
    `/v1/inventory/categories/get/${id}`,
    {
      cache: 'no-cache',
      onResponseError({ response }) {
        if (response.ok) return;
        const body = response._data as typeof ErrorResponseSchema.static;
        useToast(body.error, { description: body.reason, type: 'error' });
      },
    }
  );

  values.value = {
    name: fetchedValues?.name,
  };
});

const namePreview = computed(
  () => values.value.name?.trim() || 'Yeni Kategori'
);
</script>

<template>
  <div>
    <FormScaffold title="Kategori Düzenle" back-to="/dash/inventory/categories">
      <template #main>
        <Card>
          <CardHeader>
            <CardTitle>Detaylar</CardTitle>
            <CardDescription>
              Kategoriniz için ayırt edilebilir ve genel bir isim verin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResourceFormsCategoryForm v-model="values" @submit="onSubmit" />
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
