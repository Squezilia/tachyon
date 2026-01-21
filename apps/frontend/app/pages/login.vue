<script setup lang="ts">
import { authClient } from '@/lib/auth';
import { toTypedSchema } from '@vee-validate/zod';
import { ArrowRight } from 'lucide-vue-next';
import { useForm, Field as VeeField } from 'vee-validate';
import * as z from 'zod';
import { FieldError } from '~/components/ui/field';

const FormElement = ref<HTMLFormElement | null>(null);

const { emailRegex, passwordRegex } = useAppConfig();

const session = authClient.useSession();

const formSchema = z.object({
  email: z
    .string()
    .regex(emailRegex, 'Geçerli bir e-posta adresi girin. (ör. ad@ornek.com)'),
  password: z
    .string()
    .regex(
      passwordRegex,
      'Şifre en az 8 karakter olmalı; en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir (#?!@$%^&*-.).'
    ),
  rememberMe: z.boolean(),
});

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    email: '',
    password: '',
    rememberMe: false,
  },
  validateOnMount: false,
});

const onSubmit = handleSubmit((values) => {
  authClient.signIn.email({
    ...values,
    callbackURL: '/',
    fetchOptions: {
      onError(context) {
        useToast(context.error.name, {
          description: context.error.message,
          type: 'error',
        });
      },
      onSuccess() {
        useToast('Giriş Yapıldı', { type: 'success' });
      },
    },
  });
});

watch(
  () => session.value.data,
  (n) => {
    if (n) useRouter().push('/');
  }
);
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <section
      class="grid grid-cols-9 xl:w-2xl overflow-hidden rounded-xl xl:min-h-105"
    >
      <form
        ref="FormElement"
        class="col-span-5 p-4 space-y-4"
        @submit="onSubmit"
      >
        <div>
          <SubHeading class="font-extrabold font-display">Giriş Yap</SubHeading>
          <span class="text-sm text-muted-foreground text-pretty"
            >Tachyon'da devam etmek için giriş yap.</span
          >
        </div>
        <FieldSet>
          <FieldGroup>
            <VeeField v-slot="{ field, errors }" name="email">
              <Field>
                <FieldLabel for="email"> E-Posta </FieldLabel>
                <Input
                  id="email"
                  v-bind="field"
                  tabindex="1"
                  type="email"
                  placeholder="username@mail.com"
                  required
                />
                <FieldError v-if="errors.length" :errors="errors" />
              </Field>
            </VeeField>

            <VeeField v-slot="{ field, errors }" name="password">
              <Field>
                <FieldLabel for="password"> Şifre </FieldLabel>
                <Input
                  id="password"
                  v-bind="field"
                  tabindex="2"
                  type="password"
                  placeholder="••••••••••••"
                  required
                />
                <FieldError v-if="errors.length" :errors="errors" />
              </Field>
            </VeeField>

            <VeeField v-slot="{ field, errors }" name="remember">
              <Field orientation="horizontal">
                <div>
                  <Switch
                    id="remember"
                    tabindex="4"
                    :model-value="field.value"
                    :aria-invalid="!!errors.length"
                    @update:model-value="field.onChange"
                  />
                </div>
                <FieldContent>
                  <FieldLabel for="remember"> Oturumu Hatırla </FieldLabel>
                </FieldContent>
              </Field>
            </VeeField>
          </FieldGroup>
        </FieldSet>
        <ButtonGroup>
          <Button tabindex="3" class="group/arrow-parent min-w-32">
            Giriş Yap <ArrowRight />
          </Button>
          <ButtonGroupSeparator />
          <Button variant="secondary">
            <Icon name="fa6-brands:google" /> Google</Button
          >
          <ButtonGroupSeparator />
          <Button variant="secondary">
            <Icon name="fa6-brands:discord" /> Discord</Button
          >
        </ButtonGroup>
        <NuxtLink to="/register" class="text-xs underline text-primary"
          >Lena'ya kaydolmak ücretsiz, aklınızda bulunsun bence.</NuxtLink
        >
      </form>
      <div class="col-span-4 pl-2.5 relative">
        <div
          class="absolute bottom-0 left-0 z-10 w-48 h-full mask-[linear-gradient(to_left,rgba(0,0,0,0)_0%,rgba(0,0,0,0.25)_25%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,1)_100%)] backdrop-blur-sm"
        />

        <NuxtImg
          class="w-full h-full object-center object-cover z-0 mask-[linear-gradient(to_right,rgba(0,0,0,0)_0%,rgba(0,0,0,0.25)_8.3%,rgba(0,0,0,0.5)_16.6%,rgba(0,0,0,1)_25%)]"
          src="/1682782540_youloveit_com_villains_are_destined_to-_die_soul_illustration4.jpg"
        />
      </div>
    </section>
  </div>
</template>
