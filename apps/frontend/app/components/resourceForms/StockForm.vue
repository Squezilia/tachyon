<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Field as VeeField } from 'vee-validate';
import { Loader2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import formatPrice from '@/lib/formatPrice';
import * as z from 'zod';
import { Field } from '~/components/ui/field';

type ProductOption = { name: string; id: string; price: string };

const router = useRouter();
const products = ref<ProductOption[]>([]);
const locale = Intl.DateTimeFormat().resolvedOptions().locale;

const formSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  minQuantity: z.number(),
  maxQuantity: z.number().optional(),
  lastRestockedAt: z.date().optional(),
});

export type FormType = Partial<typeof formSchema._type>;

defineProps<{
  modelValue: FormType;
  isSubmitting?: boolean;
}>();

defineEmits<{
  submit: [FormType];
  'update:modelValue': [FormType | undefined];
  'update:isSubmitting': [boolean];
}>();

onMounted(async () => {
  const productList = await useNuxtApp().$api(
    '/v1/inventory/products/get/raw',
    {
      credentials: 'include',
      async onRequestError(context) {
        if (!context.response) return;
        if (context.response.status >= 400 || context.response.status < 500) {
          const body = (await context.response.json()) as {
            error: string;
            reason: string;
          };

          useToast(body.error, { description: body.reason, type: 'error' });
        }
      },
    }
  );

  products.value = productList as ProductOption[];
});
</script>

<template>
  <ResourceFormsFormBase
    :model-value="modelValue"
    :is-submitting="isSubmitting"
    class="space-y-6"
    :form-schema="formSchema"
    @update:model-value="$emit('update:modelValue', $event)"
    @update:is-submitting="$emit('update:isSubmitting', $event)"
    @submit="(values) => $emit('submit', values)"
  >
    <FieldGroup>
      <VeeField v-slot="{ field, errors }" name="productId">
        <Field>
          <FieldLabel>Product</FieldLabel>
          <Select
            :model-value="field.value"
            @update:model-value="field.onChange"
            @blur="field.onBlur"
          >
            <SelectTrigger :aria-invalid="!!errors.length">
              <SelectValue placeholder="Ürün Seçiniz..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="product in products"
                :key="product.id"
                :value="product.id"
              >
                {{ product.name }} ·
                {{ formatPrice(product.price, 'TRY', locale) }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FieldError v-bind="errors" />
        </Field>
      </VeeField>
    </FieldGroup>

    <div class="grid gap-4 md:grid-cols-2">
      <VeeField v-slot="{ field, errors }" name="quantity">
        <Field :data-invalid="!!errors.length">
          <FieldLabel for="name"> Ürün Miktarı </FieldLabel>
          <NumberField
            :model-value="field.value"
            :aria-invalid="!!errors.length"
            required
            :min="0"
            :max="2147483647"
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

      <VeeField v-slot="{ field, errors }" name="minQuantity">
        <Field :data-invalid="!!errors.length">
          <FieldLabel for="name"> Minimum Miktar </FieldLabel>
          <NumberField
            :model-value="field.value"
            :aria-invalid="!!errors.length"
            required
            :min="0"
            :max="2147483647"
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

      <VeeField v-slot="{ field, errors }" name="maxQuantity">
        <Field :data-invalid="!!errors.length">
          <FieldLabel for="name"> Maksimum Miktar </FieldLabel>
          <NumberField
            :model-value="field.value"
            :aria-invalid="!!errors.length"
            :min="0"
            :max="2147483647"
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

      <VeeField v-slot="{ field, errors }" name="lastRestockedAt">
        <Field :data-invalid="!!errors.length">
          <FieldLabel for="name"> En Son Dolum Tarihi </FieldLabel>
          <DatePicker
            v-model:date="field.value"
            @update:model-value="field.onChange"
          />
          <FieldError v-if="errors.length" :errors="errors" />
        </Field>
      </VeeField>
    </div>

    <div class="flex justify-end gap-2">
      <Button
        variant="outline"
        type="button"
        @click="router.push('/dash/inventory/stocks')"
      >
        Cancel
      </Button>
      <Button class="gap-2" type="submit" :disabled="isSubmitting">
        <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
        <span>{{ isSubmitting ? 'Creating...' : 'Create stock' }}</span>
      </Button>
    </div>
  </ResourceFormsFormBase>
</template>
