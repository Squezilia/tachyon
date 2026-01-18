<script setup lang="ts">
import { computed } from 'vue';
import { useForm, Field as VeeField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { Loader2, Plus } from 'lucide-vue-next';
import FormScaffold from '@/components/FormScaffold.vue';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import * as z from 'zod';
import { FieldGroup, Field, FieldLabel } from '~/components/ui/field';
import { toast } from 'vue-sonner';

definePageMeta({
  middleware: ['auth'],
});

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Kategori adı 2 karakterden kısa olamaz.')
    .max(64, 'Kategori adı 64 karakterden uzun olamaz.'),
});

const { handleSubmit, controlledValues, isSubmitting } = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    name: '',
  },
});

const onSubmit = handleSubmit(async (values) => {
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
});

const namePreview = computed(
  () => controlledValues.value.name?.trim() || 'Yeni Kategori'
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
            <form class="space-y-6" @submit="onSubmit">
              <FieldGroup>
                <VeeField v-slot="{ field, errors }" name="name">
                  <Field :data-invalid="!!errors.length">
                    <FieldLabel for="name"> Kategori Adı </FieldLabel>
                    <Input
                      v-bind="field"
                      id="name"
                      tabindex="1"
                      type="text"
                      placeholder="Beyaz Eşyalar"
                      :aria-invalid="!!errors.length"
                      required
                    />
                    <FieldError v-if="errors.length" :errors="errors" />
                  </Field>
                </VeeField>
              </FieldGroup>

              <div class="flex justify-end gap-2">
                <Button class="gap-2" type="submit" :disabled="isSubmitting">
                  <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
                  <span>
                    {{
                      isSubmitting ? 'Oluşturuluyor...' : 'Kategoriyi Oluştur'
                    }}
                  </span>
                  <Plus v-if="!isSubmitting" />
                </Button>
              </div>
            </form>
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
