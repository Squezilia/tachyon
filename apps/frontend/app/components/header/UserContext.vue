<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';
import { authClient } from '~/lib/auth';
import shortenName from '~/lib/shortenName';

const user = authClient.useSession();
</script>

<template>
  <div v-if="user.data" class="flex items-center">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" class="px-2.5! pl-1.5! pr-2!">
          <Avatar class="size-7">
            <AvatarImage src="" />
            <AvatarFallback class="text-xs">
              {{ shortenName(user.data.user.name) }}
            </AvatarFallback>
          </Avatar>
          <span class="hidden sm:block">{{ user.data.user.name }}</span>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownContentUser />
    </DropdownMenu>
  </div>
</template>
