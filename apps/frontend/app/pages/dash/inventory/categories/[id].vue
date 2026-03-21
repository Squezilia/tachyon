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

definePageMeta({
  middleware: ['auth'],
});

const values = ref<FormType>({
  name: '',
});
const id = `${useRoute().params.id}`;

async function onSubmit(values: FormType) {
  const result = await client.v1.inventory
    .categories({ id })
    .patch({
      name: values.name,
    })
    .catch(useClientError);

  if (!result) return;

  useToast('Kategori Düzenlendi!', {
    type: 'success',
  });
}

onMounted(async () => {
  const res = await client.v1.inventory
    .categories({ id })
    .get()
    .catch(useClientError);

  if (!res || !res.data) return;

  values.value = {
    name: res.data.name,
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
