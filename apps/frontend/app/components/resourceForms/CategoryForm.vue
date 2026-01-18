<script setup lang="ts">
import { useForm, Field as VeeField } from 'vee-validate';
import { Loader2, Plus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, Field, FieldLabel } from '~/components/ui/field';
import * as z from 'zod';
import { toTypedSchema } from '@vee-validate/zod';

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Kategori adı 2 karakterden kısa olamaz.')
    .max(64, 'Kategori adı 64 karakterden uzun olamaz.')
    .nonempty('Kategori ismi gerekmektedir.'),
});

export type FormType = Partial<typeof formSchema._type>;

const modelValues = defineModel('values', {
  type: Object as PropType<FormType>,
});

const emit = defineEmits<{
  submit: [FormType];
}>();

const { handleSubmit, isSubmitting, setValues, resetForm, values } = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: modelValues.value,
});

const onSubmit = handleSubmit(async (values) => {
  emit('submit', values);
});

watch(modelValues, (newv) => {
  if (newv) setValues(newv);
  else resetForm();
});

watch(values, (newv) => {
  modelValues.value = newv;
});
</script>

<template>
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
          {{ isSubmitting ? 'Oluşturuluyor...' : 'Kategoriyi Oluştur' }}
        </span>
        <Plus v-if="!isSubmitting" />
      </Button>
    </div>
  </form>
</template>
