<template>
  <DropdownMenu>
    <ClientOnly>
      <DropdownMenuTrigger>
        <Avatar v-if="session.data" class="ring-2 ring-primary">
          <AvatarImage src="" />
          <AvatarFallback class="text-sm">
            {{ shortenName(session.data.user.name) }}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
    </ClientOnly>
    <DropdownContentUser />
  </DropdownMenu>
</template>

<script lang="ts" setup>
import { authClient } from '~/lib/auth';
import shortenName from '~/lib/shortenName';

const session = authClient.useSession();
</script>

<style></style>
