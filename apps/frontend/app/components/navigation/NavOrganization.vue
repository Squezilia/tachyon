<template>
  <ButtonGroup>
    <Button variant="ghost" class="flex items-center text-sm gap-2.5 xs:px-2 px-1 h-8" @click="$router.push('/dash')">
      <Avatar class="size-7 xs:hidden">
        <AvatarImage :src="activeOrganization.data?.logo || ''" />
        <AvatarFallback>
          {{ shortenName(activeOrganization.data?.name || '') }}
        </AvatarFallback>
      </Avatar>
      <span class="hidden xs:flex items-center gap-2.5">
        {{ activeOrganization.data?.name }}
      </span>
    </Button>
    <NavOrganizationChanger />
  </ButtonGroup>
</template>

<script lang="ts" setup>
import { authClient } from '~/lib/auth';
import shortenName from '~/lib/shortenName';
import NavOrganizationChanger from './NavOrganizationChanger.vue';
import { ButtonGroup } from '../ui/button-group';

const activeOrganization = authClient.useActiveOrganization();
</script>

<style></style>
