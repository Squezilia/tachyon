<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

const props = defineProps<{
  title: string;
  description?: string;
  backTo?: string;
}>();

const router = useRouter();

const handleBack = () => {
  if (props.backTo) return router.push(props.backTo);
  return router.back();
};
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div class="space-y-1.5">
        <h1 class="text-3xl font-semibold">{{ title }}</h1>
        <p v-if="description" class="text-sm text-muted-foreground">
          {{ description }}
        </p>
      </div>
      <Button variant="ghost" size="sm" class="gap-2" @click="handleBack">
        <ArrowLeft class="size-4" />
        Geri
      </Button>
    </div>

    <div class="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <slot name="main" />
      <slot name="aside" />
    </div>
  </div>
</template>
