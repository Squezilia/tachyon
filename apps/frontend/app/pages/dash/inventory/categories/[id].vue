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
import type { ErrorResponseSchema } from '@backend/model';
import type { CategoryPlain } from '@database';

definePageMeta({
  middleware: ['auth'],
});

const values = ref<FormType>({
  name: '',
});
const id = useRoute().params.id;

function onSubmit(values: FormType) {
  toast.promise<string>(
    new Promise((resolve, reject) =>
      useApi(`/v1/inventory/categories/update/${id}`, {
        method: 'PATCH',
        body: {
          name: values.name,
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
          resolve('Kategori Düzenlendi!');
          useRouter().push('/dash/inventory/categories');
        },
      })
    ),
    {
      loading: 'Kategori Düzenleniyor...',
      success: (data: string) => data,
      error: (data: string) => data,
    }
  );
}

onMounted(async () => {
  const fetchedValues = await useApi<typeof CategoryPlain.static>(
    `/v1/inventory/categories/get/${id}`,
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

  values.value = {
    name: fetchedValues.data.value?.name,
  };
});

const namePreview = computed(
  () => values.value.name?.trim() || 'Yeni Kategori'
);
</script>

<template>
  <div>
    <FormScaffold
      section="Envanter"
      title="Kategori Düzenle"
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
