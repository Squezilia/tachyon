<script setup lang="ts">
import { Ellipsis } from 'lucide-vue-next';
import { ref, type FunctionalComponent } from 'vue';

export interface Action {
  group: string;
  title: string;
  icon: FunctionalComponent;
  type?: 'default' | 'destructive';
  needRequire?: boolean;
  action: () => void;
}

interface ActionViewRaw {
  title: string;
  type?: 'default' | 'destructive';
  icon: FunctionalComponent;
  action: () => void;
  hasSeparatorBefore: boolean;
  needRequire?: boolean;
}

const props = withDefaults(
  defineProps<{
    actions: Action[];
    requireTitle?: string;
    requireDescription?: string;
  }>(),
  {
    requireTitle: 'Gerçekten emin misiniz?',
    requireDescription:
      'Bu işlem geri alınamaz! Bu işlem sonucunda bu kaynak sistemlerimizden tamamen silinecektir.',
  }
);

const delegatedActions = computed(() => {
  const actions: ActionViewRaw[] = [];
  let lastGroup: string | null = null;

  for (const action of props.actions) {
    let hasSeparatorBefore = false;
    if (lastGroup && lastGroup !== action.group) hasSeparatorBefore = true;

    actions.push({
      action: action.action,
      title: action.title,
      type: action.type,
      hasSeparatorBefore,
      icon: action.icon,
      needRequire: action.needRequire,
    });

    lastGroup = action.group;
  }

  return actions;
});

const dropdownState = ref(false);
</script>

<template>
  <DropdownMenu v-model:open="dropdownState">
    <DropdownMenuTrigger as-child>
      <button
        class="size-6.5 absolute top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer rounded-md hover:bg-accent transition"
      >
        <Ellipsis class="size-4" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" side="left">
      <template
        v-for="(act, idx) in delegatedActions"
        :key="act.title + '-' + idx"
      >
        <DropdownMenuSeparator v-if="act.hasSeparatorBefore" />
        <DropdownMenuItem
          v-if="!act.needRequire"
          :variant="act.type || 'default'"
          @select="act.action()"
        >
          <component :is="act.icon" /> {{ act.title }}
        </DropdownMenuItem>
        <AlertDialog v-else>
          <AlertDialogTrigger as-child>
            <DropdownMenuItem :variant="act.type || 'default'" @select.prevent>
              <component :is="act.icon" /> {{ act.title }}
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{{ props.requireTitle }}</AlertDialogTitle>
              <AlertDialogDescription>
                {{ props.requireDescription }}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel @click="dropdownState = false"
                >Cancel</AlertDialogCancel
              >
              <AlertDialogAction
                @click="
                  () => {
                    dropdownState = false;
                    act.action();
                  }
                "
                >Continue</AlertDialogAction
              >
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
