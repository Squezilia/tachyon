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
import client from '~/lib/api';
import useClientError from '~/composables/useClientError';
import useToast from '~/composables/useToast';
import CategoryForm from '~/components/resourceForms/CategoryForm.vue';

definePageMeta({
  middleware: ['auth'],
});

const values = ref<FormType>({
  name: '',
});

async function onSubmit(values: FormType) {
  if (!values.name) return;

  const res = await client.v1.inventory.categories
    .post({
      name: values.name,
    })
    .catch(useClientError);

  if (!res) return;

  useToast('Kategori Oluşturuldu!', {
    type: 'success',
  });
}

const namePreview = computed(
  () => values.value.name?.trim() || 'Yeni Kategori'
);
</script>

<template>
  <div>
    <FormScaffold
      title="Yeni Kategori"
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
            <CategoryForm v-model="values" @submit="onSubmit" />
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
