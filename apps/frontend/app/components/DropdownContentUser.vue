<script lang="ts" setup>
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BadgeCheck,
  LogOut,
  Shield,
  User2,
  Cog,
  LayoutTemplate,
} from 'lucide-vue-next';
import shortenName from '@/lib/shortenName';
import { authClient } from '~/lib/auth';

const session = authClient.useSession();

function logout() {
  authClient.signOut();
  useRouter().push('/login');
}
</script>

<template>
  <DropdownMenuContent
    class="min-w-[220px]"
    side="bottom"
    align="end"
    :side-offset="4"
  >
    <DropdownMenuLabel class="p-0 font-normal">
      <ClientOnly>
        <div
          v-if="session.data"
          class="flex items-center gap-2.5 px-2 py-1.5 text-left text-sm"
        >
          <Avatar class="h-8 w-8">
            <AvatarImage
              :src="session.data.user.image || ''"
              :alt="session.data.user.name"
            />
            <AvatarFallback class="rounded-lg">
              {{ shortenName(session.data.user.name) }}
            </AvatarFallback>
          </Avatar>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold">
              {{ session.data.user.name }}
            </span>
            <span class="truncate text-xs text-muted-foreground">
              {{ session.data.user.email }}
            </span>
          </div>
        </div>
      </ClientOnly>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <NuxtLink to="/dash">
        <DropdownMenuItem>
          <LayoutTemplate />
          Dashboard
        </DropdownMenuItem>
      </NuxtLink>
      <NuxtLink to="/user">
        <DropdownMenuItem>
          <User2 />
          Account
        </DropdownMenuItem>
      </NuxtLink>
      <NuxtLink to="/user/subscription">
        <DropdownMenuItem>
          <BadgeCheck />
          Billing
        </DropdownMenuItem>
      </NuxtLink>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <NuxtLink to="/user/security">
      <DropdownMenuItem>
        <Shield />
        Security
      </DropdownMenuItem>
    </NuxtLink>
    <NuxtLink to="/user/preferences">
      <DropdownMenuItem>
        <Cog />
        Preferences
      </DropdownMenuItem>
    </NuxtLink>
    <DropdownMenuSeparator />
    <DropdownMenuItem @click="logout()">
      <LogOut />
      Log Out
    </DropdownMenuItem>
  </DropdownMenuContent>
</template>
