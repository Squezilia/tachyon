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
import type { FormType } from '~/components/resourceForms/TableForm.vue';

definePageMeta({
  middleware: ['auth'],
});

const values = ref<FormType>({
  name: '',
});

function onSubmit(values: FormType) {
  useToastFetch('/v1/pos/tables/create', {
    fetchOptions: {
      method: 'POST',
      body: {
        name: values.name,
      },
    },
    toastOptions: {
      success: 'Masa Oluşturuldu!',
      loading: 'Masa Oluşturuluyor...',
      callback: '/dash/pos/tables',
    },
  });
}

const namePreview = computed(() => values.value.name?.trim() || 'Yeni Masa');
</script>

<template>
  <div>
    <FormScaffold
      title="Yeni Masa"
      description="Dükkanınızda müşterilerin kaydı için yeni bir masa oluşturun."
      back-to="/dash/pos/tables"
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
            <ResourceFormsTableForm v-model="values" @submit="onSubmit" />
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
              <p class="text-xs uppercase text-muted-foreground">Masa Adı</p>
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
