<script setup lang="ts">
import { Field as VeeField } from 'vee-validate';
import { Loader2, Plus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, Field, FieldLabel } from '~/components/ui/field';
import * as z from 'zod';

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Kategori adı 2 karakterden kısa olamaz.')
    .max(64, 'Kategori adı 64 karakterden uzun olamaz.')
    .nonempty('Kategori ismi gerekmektedir.'),
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
          {{ isSubmitting ? 'Oluşturuluyor...' : 'Kategoriyi Oluştur' }}
        </span>
        <Plus v-if="!isSubmitting" />
      </Button>
    </div>
  </ResourceFormsFormBase>
</template>
