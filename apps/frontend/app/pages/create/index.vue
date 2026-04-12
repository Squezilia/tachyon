<script lang="ts" setup>
import { computed, ref } from 'vue';
import { ArrowRight, Loader2 } from 'lucide-vue-next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authClient } from '~/lib/auth';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from '~/components/ui/field';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import type { AcceptableValue } from 'reka-ui';
import useToast from '~/composables/useToast';

definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard',
});

type OrganizationPlan = 'basic' | 'extended';

const teamSizes = {
  personal: '1-10',
  small: '11-50',
  medium: '51-100',
  big: '101-500',
  enterprise: '501+',
} as const;

type Values<T> = T[keyof T];

const router = useRouter();

const organizationName = ref('');
const teamSize = ref<Values<typeof teamSizes>>('1-10');
const organizationPlan = ref<OrganizationPlan>('basic');
const isCreating = ref(false);

const organizations = authClient.useListOrganizations();

const plans: Record<
  OrganizationPlan,
  { title: string; description: string; perks: string[] }
> = {
  basic: {
    title: 'Basic',
    description:
      'Handles everything basic, Includes; Inventory, Retail and Plugins',
    perks: ['Unlimited products', 'Retail POS-ready', 'Plugin marketplace'],
  },
  extended: {
    title: 'Extended',
    description:
      'Everything from Basic with Extended features. Includes; AI, Gastro, Campaigns.',
    perks: ['AI recommendations', 'Gastro POS', 'Campaign automation'],
  },
};

const trimmedName = computed(() => organizationName.value.trim());
const isSubmitDisabled = computed(
  () => trimmedName.value.length < 3 || isCreating.value
);
const selectedPlan = computed(() => plans[organizationPlan.value]);
const existingOrganizationCount = computed(() =>
  Array.isArray(organizations.value.data) ? organizations.value.data.length : 0
);

const updateOrganizationPlan = (value: AcceptableValue) => {
  if (value === 'basic' || value === 'extended') {
    organizationPlan.value = value;
  }
};

function createSlug(input: string) {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return base || `org-${Math.random().toString(36).slice(2, 8)}`;
}

async function handleCreateOrganization() {
  if (isSubmitDisabled.value) return;

  try {
    isCreating.value = true;

    const payload = {
      name: trimmedName.value,
      slug: createSlug(trimmedName.value),
    };

    const result = await authClient.organization.create(payload);

    if (result.error) {
      useToast('Unable to create organization', {
        description: result.error.message ?? 'Please try again later.',
        type: 'error',
      });
      return;
    }

    useToast('Organization created', {
      description: `${payload.name} is ready to go.`,
      type: 'success',
    });

    await router.push('/dash');
  } catch {
    useToast('Something went wrong', {
      description: 'Please try again in a moment.',
      type: 'error',
    });
  } finally {
    isCreating.value = false;
  }
}
</script>

<template>
  <div>
    <div class="grid gap-8 my-auto lg:grid-cols-2">
      <div class="flex flex-col gap-6">
        <div class="space-y-2">
          <p class="text-sm font-medium uppercase text-muted-foreground">
            Organization
          </p>
          <h1 class="text-4xl font-semibold md:text-5xl">
            Let's start your journey with us.
          </h1>
          <p class="text-muted-foreground">
            Name your workspace and we'll prepare everything else behind the
            scenes.
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2.5">
              <Label>Organization Name</Label>
              <Input
                v-model="organizationName"
                placeholder="Acme Inc."
                autocomplete="organization"
              />
              <p class="text-xs text-muted-foreground">
                We'll auto-generate the slug, no extra field needed.
              </p>
            </div>
            <div class="space-y-2.5">
              <Label>Team Size</Label>
              <Select v-model="teamSize">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Team size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="[name, value] in Object.entries(teamSizes)"
                    :key="name"
                    :value="value"
                  >
                    {{ value }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-xs text-muted-foreground">
                Saved for billing later. Nothing is charged today.
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-4">
            <FieldGroup>
              <FieldSet>
                <FieldLabel for="compute-environment-p8w">
                  Organization Billing
                </FieldLabel>
                <FieldDescription>
                  We'll store this alongside billing preferences, but you can
                  change it anytime.
                </FieldDescription>
                <RadioGroup
                  :model-value="organizationPlan"
                  @update:model-value="updateOrganizationPlan"
                >
                  <FieldLabel
                    v-for="[planKey, plan] of Object.entries(plans)"
                    :key="planKey"
                    :for="planKey"
                  >
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>{{ plan.title }}</FieldTitle>
                        <FieldDescription
                          >{{ plan.description }}
                        </FieldDescription>
                      </FieldContent>
                      <RadioGroupItem :id="planKey" :value="planKey" />
                    </Field>
                  </FieldLabel>
                </RadioGroup>
              </FieldSet>
            </FieldGroup>
          </div>
          <Button
            class="w-fit gap-2"
            :disabled="isSubmitDisabled"
            @click="handleCreateOrganization"
          >
            <Loader2 v-if="isCreating" class="size-4 animate-spin" />
            <span>{{ isCreating ? 'Creating' : 'Create' }}</span>
            <ArrowRight class="size-4" />
          </Button>
        </div>
      </div>
      <div
        class="h-full rounded-2xl border bg-card/50 p-6 backdrop-blur-sm flex flex-col gap-5"
      >
        <div>
          <p class="text-sm uppercase tracking-wide text-muted-foreground">
            Preview
          </p>
          <h2 class="text-3xl font-semibold">
            {{ trimmedName || 'Your organization' }}
          </h2>
          <p class="text-sm text-muted-foreground">
            {{ selectedPlan.description }}
          </p>
        </div>
        <div class="grid gap-3">
          <div class="rounded-xl border bg-background/60 p-4">
            <p class="text-xs uppercase tracking-wide text-muted-foreground">
              Team Size
            </p>
            <p class="text-xl font-medium">{{ teamSize }}</p>
            <p class="text-xs text-muted-foreground">
              Only used to tailor billing later.
            </p>
          </div>
          <div class="rounded-xl border bg-background/60 p-4">
            <p class="text-xs uppercase tracking-wide text-muted-foreground">
              Plan
            </p>
            <p class="text-xl font-medium">{{ selectedPlan.title }}</p>
            <ul class="mt-2 space-y-1 text-sm text-muted-foreground">
              <li v-for="perk in selectedPlan.perks" :key="perk">
                {{ perk }}
              </li>
            </ul>
          </div>
        </div>
        <div
          class="rounded-xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground"
        >
          You're currently managing
          <span class="font-semibold">{{ existingOrganizationCount }}</span>
          organization{{ existingOrganizationCount === 1 ? '' : 's' }}. Creating
          another won't impact your active workspace.
        </div>
        <p class="text-sm text-muted-foreground">
          Billing isn't enabled yet. We simply store these preferences so you
          can upgrade without doing the paperwork twice.
        </p>
      </div>
    </div>
  </div>
</template>
