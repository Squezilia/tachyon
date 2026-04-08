<script setup lang="ts">
import { authClient } from '@/lib/auth';
import * as z from 'zod';
import {
  Carousel,
  CarouselContent,
  type CarouselApi,
} from '~/components/ui/carousel';
import { useForm, Field as VeeField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { ArrowLeft } from 'lucide-vue-next';
import { motion } from 'motion-v';

const FormElement = ref<HTMLFormElement | null>(null);

const { emailRegex, passwordRegex } = useAppConfig();

const session = authClient.useSession();

const formSchema = z
  .object({
    name: z
      .string()
      .min(3, 'İsim 3 karakterden az olamaz.')
      .max(60, 'İsim 60 karakterden fazla olamaz.'),
    email: z
      .string()
      .regex(
        emailRegex,
        'Geçerli bir e-posta adresi girin. (ör. ad@ornek.com)'
      ),
    password: z
      .string()
      .regex(
        passwordRegex,
        'Şifre en az 8 karakter olmalı; en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir (#?!@$%^&*-.).'
      ),
    passwordAgain: z
      .string()
      .regex(
        passwordRegex,
        "'Şifre en az 8 karakter olmalı; en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir (#?!@$%^&*-.)."
      ),
    privacy: z.boolean(),
    tos: z.boolean(),
  })
  .superRefine(({ password, passwordAgain, privacy, tos }, ctx) => {
    if (password && passwordAgain && password !== passwordAgain) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['passwordAgain'],
        message: 'Şifreler eşleşmiyor.',
      });
    }

    if (!privacy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['privacy'],
        message: 'Devam etmek için KVKK onayını işaretleyin.',
      });
    }

    // TOS zorunlu
    if (!tos) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tos'],
        message: 'Devam etmek için Kullanım Şartları’nı kabul edin.',
      });
    }
  });

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    name: '',
    email: '',
    password: '',
    passwordAgain: '',
    privacy: false,
    tos: false,
  },
  validateOnMount: false,
});

const onSubmit = handleSubmit((values) => {
  authClient.signUp.email({
    ...values,
    fetchOptions: {
      onError(context) {
        useToast(context.error.name, {
          description: context.error.message,
          type: 'error',
        });
      },
      onSuccess() {
        useToast('Kayıt Olundu.', { type: 'success' });
      },
    },
  });
});

const slideIndex = ref(0);
const carousel = ref<CarouselApi>();

function setApi(val: CarouselApi) {
  carousel.value = val;

  if (!val) return;

  val.on('select', () => {
    slideIndex.value = val.selectedScrollSnap();
  });
}

function scrollNext() {
  if (!carousel.value) return;
  carousel.value.scrollNext();
}

function scrollPrev() {
  if (!carousel.value) return;
  carousel.value.scrollPrev();
}

watch(
  () => session.value.data,
  (n) => {
    if (n) useRouter().push('/');
  }
);
</script>

<template>
  <div class="w-full flex items-center h-full justify-center">
    <section
      class="grid grid-cols-9 xl:w-2xl overflow-hidden rounded-xl xl:min-h-105"
    >
      <form
        ref="FormElement"
        class="col-span-5 p-4 space-y-4"
        @submit="onSubmit"
      >
        <div>
          <SubHeading
            class="font-extrabold font-display flex items-center gap-2.5"
          >
            <motion.template layout>
              <Button
                v-if="slideIndex > 0"
                size="icon"
                variant="ghost"
                @click="scrollPrev()"
                ><ArrowLeft
              /></Button>
            </motion.template>
            <motion.span>Kayıt Ol</motion.span></SubHeading
          >

          <span class="text-sm text-muted-foreground text-pretty"
            >Tachyon'a devam etmek için kayıt ol.</span
          >
        </div>
        <FieldSet>
          <Carousel
            :opts="{ watchDrag: false, duration: 20 }"
            @init-api="setApi"
          >
            <CarouselContent>
              <CarouselItem>
                <FieldGroup class="p-0.75">
                  <VeeField v-slot="{ field, errors }" name="name">
                    <Field :data-invalid="!!errors.length">
                      <FieldLabel for="name"> İsim </FieldLabel>
                      <Input
                        v-bind="field"
                        id="name"
                        tabindex="1"
                        type="text"
                        placeholder="Penelope Eckhart"
                        :aria-invalid="!!errors.length"
                        required
                      />
                      <FieldError v-if="errors.length" :errors="errors" />
                    </Field>
                  </VeeField>
                  <VeeField v-slot="{ field, errors }" name="email">
                    <Field :data-invalid="!!errors.length">
                      <FieldLabel for="email"> E-Posta </FieldLabel>
                      <Input
                        v-bind="field"
                        id="email"
                        tabindex="1"
                        type="email"
                        placeholder="username@mail.com"
                        :aria-invalid="!!errors.length"
                        required
                      />
                      <FieldError v-if="errors.length" :errors="errors" />
                    </Field>
                  </VeeField>
                </FieldGroup>
              </CarouselItem>
              <CarouselItem>
                <FieldGroup class="p-0.75">
                  <VeeField v-slot="{ field, errors }" name="password">
                    <Field :data-invalid="!!errors.length">
                      <FieldLabel for="password"> Şifre </FieldLabel>
                      <Input
                        v-bind="field"
                        id="password"
                        tabindex="2"
                        type="password"
                        placeholder="••••••••••••"
                        :aria-invalid="!!errors.length"
                        required
                      />
                      <FieldError v-if="errors.length" :errors="errors" />
                    </Field>
                  </VeeField>
                  <VeeField v-slot="{ field, errors }" name="passwordAgain">
                    <Field :data-invalid="!!errors.length">
                      <FieldLabel for="password2"> Şifre (Tekrar) </FieldLabel>
                      <Input
                        v-bind="field"
                        id="password2"
                        tabindex="2"
                        type="password"
                        placeholder="••••••••••••"
                        :aria-invalid="!!errors.length"
                        required
                      />
                      <FieldError v-if="errors.length" :errors="errors" />
                    </Field>
                  </VeeField>
                </FieldGroup>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
          <FieldGroup class="gap-2">
            <VeeField v-slot="{ field, errors }" name="privacy">
              <Field orientation="horizontal">
                <Checkbox
                  id="privacy"
                  :model-value="field.value"
                  :aria-invalid="!!errors.length"
                  @update:model-value="field.onChange"
                />
                <FieldLabel for="privacy" class="text-muted-foreground"
                  >Gizlilik sözleşmesini kabul ediyorum</FieldLabel
                >
              </Field>
              <FieldError v-if="errors.length" :errors="errors" />
            </VeeField>
            <VeeField v-slot="{ field, errors }" name="tos">
              <Field orientation="horizontal">
                <Checkbox
                  id="tos"
                  :model-value="field.value"
                  :aria-invalid="!!errors.length"
                  @update:model-value="field.onChange"
                />
                <FieldLabel for="tos" class="text-muted-foreground"
                  >Kullanım koşullarını kabul ediyorum</FieldLabel
                >
              </Field>
              <FieldError v-if="errors.length" :errors="errors" />
            </VeeField>
          </FieldGroup>
        </FieldSet>
        <ButtonGroup>
          <Button
            tabindex="3"
            type="button"
            class="group/arrow-parent min-w-32"
            @click="slideIndex > 0 ? onSubmit() : scrollNext()"
            >Devam Et <ArrowRight
          /></Button>
          <ButtonGroupSeparator />
          <Button variant="secondary">
            <Icon name="fa6-brands:google" /> Google</Button
          >
          <ButtonGroupSeparator />
          <Button variant="secondary">
            <Icon name="fa6-brands:discord" /> Discord</Button
          >
        </ButtonGroup>
        <NuxtLink to="/login" class="text-xs underline text-primary"
          >Bence mevcut hesabını kullanmaktan zarar gelmez, gibi?</NuxtLink
        >
      </form>
      <div class="col-span-4 pl-2.5 relative">
        <div
          class="absolute bottom-0 left-0 z-10 w-48 h-full mask-[linear-gradient(to_left,rgba(0,0,0,0)_0%,rgba(0,0,0,0.25)_25%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,1)_100%)] backdrop-blur-sm"
        />

        <NuxtImg
          class="w-full h-full object-center object-cover z-0 mask-[linear-gradient(to_right,rgba(0,0,0,0)_0%,rgba(0,0,0,0.25)_8.3%,rgba(0,0,0,0.5)_16.6%,rgba(0,0,0,1)_25%)]"
          src="/1682782502_youloveit_com_villains_are_destined_to-_die_soul_illustration5.jpg"
        />
      </div>
    </section>
  </div>
</template>
