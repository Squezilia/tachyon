<script setup lang="ts">
import { useForm, Field as VeeField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { Loader2, Plus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as z from 'zod';
import { Field, FieldLabel } from '~/components/ui/field';
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
} from '~/components/ui/number-field';
import { toast } from 'vue-sonner';

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Kategori adı 2 karakterden kısa olamaz.')
    .max(64, 'Kategori adı 64 karakterden uzun olamaz.'),
  price: z
    .number()
    .min(0, 'Ürün fiyatı negatif olamaz.')
    .max(2147483647, 'Ürün fiyatı kabul edilebilir sınırlar içinde olmalıdır.'),
  categoryId: z.string(),
});

export type FormType = Partial<typeof formSchema._type>;

const modelValues = defineModel('values', {
  type: Object as PropType<FormType>,
});

const { handleSubmit, isSubmitting, setValues, resetForm, values } = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: modelValues.value,
});

watch(modelValues, (newv) => {
  if (newv) setValues(newv);
  else resetForm();
});

watch(values, (newv) => {
  modelValues.value = newv;
});

const emit = defineEmits<{
  submit: [FormType];
}>();

const onSubmit = handleSubmit(async (values) => {
  emit('submit', values);
});

const categoryList = (await useNuxtApp()
  .$api('/v1/inventory/categories/get/raw', {
    credentials: 'include',
  })
  .catch((err: { error: string; reason: string }) => {
    toast(err.error, { description: err.reason });
  })) as { name: string; id: string }[];
</script>

<template>
  <form class="space-y-6" @submit="onSubmit">
    <VeeField v-slot="{ field, errors }" name="name">
      <Field :data-invalid="!!errors.length">
        <FieldLabel for="name"> Ürün Adı </FieldLabel>
        <Input
          v-bind="field"
          id="name"
          tabindex="1"
          type="text"
          placeholder="45cm Zurna Dürüm"
          :aria-invalid="!!errors.length"
          required
        />
        <FieldError v-if="errors.length" :errors="errors" />
      </Field>
    </VeeField>
    <div class="grid grid-cols-2 gap-6">
      <VeeField v-slot="{ field, errors }" name="price">
        <Field :data-invalid="!!errors.length">
          <FieldLabel for="name"> Ürün Fiyatı </FieldLabel>
          <NumberField
            :model-value="field.value"
            :aria-invalid="!!errors.length"
            required
            :min="0"
            :max="2147483647"
            :format-options="{
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
              style: 'currency',
              currencySign: 'standard',
              currency: 'TRY',
              currencyDisplay: 'narrowSymbol',
            }"
            @update:model-value="field.onChange"
          >
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
          <FieldError v-if="errors.length" :errors="errors" />
        </Field>
      </VeeField>
      <VeeField v-slot="{ field, errors }" name="categoryId">
        <Field :data-invalid="!!errors.length">
          <FieldLabel for="name"> Kategori </FieldLabel>
          <Select
            :model-value="field.value"
            @update:model-value="field.onChange"
            @blur="field.onBlur"
          >
            <SelectTrigger :aria-invalid="!!errors.length">
              <SelectValue placeholder="Kategori seçiniz.." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="category of categoryList"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FieldError v-if="errors.length" :errors="errors" />
        </Field>
      </VeeField>
    </div>

    <div class="flex justify-end gap-2">
      <Button class="gap-2" type="submit" :disabled="isSubmitting">
        <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
        <span>
          {{ isSubmitting ? 'Oluşturuluyor...' : 'Ürünü Oluştur' }}
        </span>
        <Plus v-if="!isSubmitting" />
      </Button>
    </div>
  </form>
</template>
