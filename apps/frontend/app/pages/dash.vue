<script lang="ts" setup>
import { watch } from 'vue';
import { authClient } from '@/lib/auth';
import useToast from '~/composables/useToast';

definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard',
});

const organizations = authClient.useListOrganizations();
const activeOrganization = authClient.useActiveOrganization();

watch(
  [organizations, activeOrganization],
  async ([orgs, active]) => {
    if (!orgs) return;

    if (Array.isArray(orgs) && orgs.length === 0) {
      return navigateTo('/create');
    }

    // If user has orgs but no active org (e.g., deleted/left), select one
    if (!active && Array.isArray(orgs) && orgs.length > 0) {
      const first = orgs[0];
      try {
        await authClient.organization.setActive({
          organizationId: first.id,
          organizationSlug: first.slug,
        });
      } catch {
        useToast('Failed to select organization', {
          description: 'Please choose an organization from the menu.',
          type: 'error',
        });
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <NuxtPage />
</template>
