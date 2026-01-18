<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="w-6 h-8">
        <ChevronDown class="size-4 mt-0.5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="min-w-[320px]" side="bottom" align="center">
      <DropdownMenuLabel class="text-muted-foreground">
        Organizations
      </DropdownMenuLabel>
      <DropdownMenuItem
        v-for="(org, idx) in organizations.data"
        :key="org.id"
        :value="org.id"
        @click="
          authClient.organization.setActive({
            organizationId: org.id,
            organizationSlug: org.slug,
          })
        "
      >
        <Avatar class="size-6">
          <AvatarImage :src="org.logo || ''" />
          <AvatarFallback class="text-xs">
            {{ shortenName(org.name) }}
          </AvatarFallback>
        </Avatar>
        <span class="truncate">
          {{ org.name }}
        </span>
        <DropdownMenuShortcut>
          <KbdGroup>
            <Kbd>⌘</Kbd> <Kbd>{{ idx + 1 }}</Kbd>
          </KbdGroup>
        </DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem as-child>
        <NuxtLink to="/create">
          <div class="size-6 grid place-items-center">
            <Plus />
          </div>
          <span class="text-muted-foreground">Create Organization</span>
          <DropdownMenuShortcut>
            <KbdGroup> <Kbd>⌘</Kbd> <Kbd>C</Kbd> </KbdGroup>
          </DropdownMenuShortcut>
        </NuxtLink>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script lang="ts" setup>
import { ChevronDown, Plus } from 'lucide-vue-next';
import { authClient } from '~/lib/auth';
import shortenName from '~/lib/shortenName';
import { Kbd, KbdGroup } from '../ui/kbd';

const organizations = authClient.useListOrganizations();
</script>
