<script setup lang="ts">
import { useForm } from 'vee-validate';
import type * as z from 'zod';
import { toTypedSchema } from '@vee-validate/zod';

const { formSchema } = defineProps<{
  formSchema: z.Schema;
}>();

export type FormType = Partial<typeof formSchema._type>;

const modelValues = defineModel({
  type: Object as PropType<FormType>,
});
const isSubmitting = defineModel('isSubmitting', {
  type: Boolean,
  default: false,
  required: false,
});

const emit = defineEmits<{
  submit: [FormType];
}>();

const form = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: modelValues.value,
});

watch(form.isSubmitting, (newv) => (isSubmitting.value = newv));

defineExpose(form);

const onSubmit = form.handleSubmit(async (values) => {
  emit('submit', values);
});

watch(modelValues, (newv) => {
  if (newv) form.setValues(newv);
  else form.resetForm();
});

watch(form.values, (newv) => {
  modelValues.value = newv;
});
</script>

<template>
  <form @submit="onSubmit">
    <slot />
  </form>
</template>
