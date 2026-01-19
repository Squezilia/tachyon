<script setup lang="ts">
import { Field as VeeField } from 'vee-validate';
import { Loader2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import * as z from 'zod';

const router = useRouter();

const formSchema = z.object({
  name: z.string(),
  priority: z.number(),
  rate: z.number(),
  isFixed: z.boolean(),
  isCumulative: z.boolean(),
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
    <VeeField v-slot="{ field, errors }" name="name">
      <Field :data-invalid="!!errors.length">
        <FieldLabel for="name"> Vergi Adı </FieldLabel>
        <Input
          v-bind="field"
          id="name"
          tabindex="1"
          type="text"
          placeholder="KDV"
          :aria-invalid="!!errors.length"
          required
        />
        <FieldError v-if="errors.length" :errors="errors" />
      </Field>
    </VeeField>

    <div class="grid gap-4 md:grid-cols-2">
      <VeeField v-slot="{ field, errors }" name="priority">
        <Field :data-invalid="!!errors.length">
          <FieldLabel for="name"> Vergi Önceliği </FieldLabel>
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

      <VeeField v-slot="{ field, errors }" name="rate">
        <Field :data-invalid="!!errors.length">
          <FieldLabel for="name"> Vergi Miktarı </FieldLabel>
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
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <VeeField v-slot="{ field, errors }" name="isFixed">
        <Field orientation="horizontal" :data-invalid="!!errors.length">
          <FieldContent>
            <FieldLabel>Sabit Vergi</FieldLabel>
            <FieldDescription
              >Verginin sabit mi yoksa yüzdelik mi olduğunu belirten
              değerdir.</FieldDescription
            >
            <FieldError v-if="errors.length" :errors="errors" />
          </FieldContent>
          <Switch
            :model-value="field.value"
            :aria-invalid="!!errors.length"
            @update:model-value="field.onChange"
          />
        </Field>
      </VeeField>

      <VeeField v-slot="{ field, errors }" name="isCumulative">
        <Field orientation="horizontal" :data-invalid="!!errors.length">
          <FieldContent>
            <FieldLabel>Kümulatif Vergi</FieldLabel>
            <FieldDescription
              >Verginin diğer vergilerle üst üste binip binemeyeceğini
              belirtir.</FieldDescription
            >
            <FieldError v-if="errors.length" :errors="errors" />
          </FieldContent>
          <Switch
            :model-value="field.value"
            :aria-invalid="!!errors.length"
            @update:model-value="field.onChange"
          />
        </Field>
      </VeeField>
    </div>

    <div class="flex justify-end gap-2">
      <Button
        variant="outline"
        type="button"
        @click="router.push('/dash/management/taxes')"
      >
        Cancel
      </Button>
      <Button class="gap-2" type="submit" :disabled="isSubmitting">
        <Loader2 v-if="isSubmitting" class="size-4 animate-spin" />
        <span>{{ isSubmitting ? 'Creating...' : 'Create tax' }}</span>
      </Button>
    </div>
  </ResourceFormsFormBase>
</template>
