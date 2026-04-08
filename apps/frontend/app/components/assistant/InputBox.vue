<script setup lang="ts">
import { ArrowUp, Check, ChevronDown, Loader2, Plus, X } from 'lucide-vue-next';
import type { PropType } from 'vue';

const props = defineProps<{
  running?: boolean;
}>();

const modes = { agent: 'Agent', chat: 'Sohbet' };
const models = {
  'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-3-flash-preview': 'Gemini 3 Flash',
  'gemini-3-pro-preview': 'Gemini 3 Pro',
};

export type AssistantMode = keyof typeof modes;
export type AssistantModel = keyof typeof models;
export type UIAssistantModel = AssistantModel | 'auto-model';

const uiModels = {
  ...models,
  'auto-model': 'Auto',
};

const assistantMode = defineModel('mode', {
  type: String as PropType<AssistantMode>,
  default: 'chat',
  required: true,
});
const assistantModel = defineModel('model', {
  type: String as PropType<UIAssistantModel>,
  default: 'auto-model',
  required: true,
});

const contextList = [
  {
    id: 'product-1',
    name: 'Product 1',
    type: 'product',
  },
  {
    id: 'category-1',
    name: 'Category 1',
    type: 'category',
  },
];

const emit = defineEmits<{
  submit: [string];
  abort: [];
}>();

const content = ref('');

function submit(ev?: KeyboardEvent) {
  if (content.value.trim().length < 1 || (ev && ev.shiftKey) || props.running)
    return;
  emit('submit', content.value);
  content.value = '';
  if (ev) ev.preventDefault();
}
</script>

<template>
  <InputGroup class="max-w-2xl mx-auto rounded-xl">
    <InputGroupAddon v-if="false" align="block-start">
      <ChatContextChip> <Plus /> İçerik Ekle </ChatContextChip>
      <ChatContextChip v-for="context in contextList" :key="context.id">
        <X /> {{ context.name }}
      </ChatContextChip>
    </InputGroupAddon>
    <InputGroupTextarea
      v-model="content"
      :disabled="running"
      placeholder="Mesaj yazın..."
      @keydown.enter="submit"
    />
    <InputGroupAddon align="block-end">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <InputGroupButton variant="ghost" aria-label="More" size="xs">
            <span class="text-xs">
              {{ modes[assistantMode as AssistantMode] }}
            </span>
            <ChevronDown />
          </InputGroupButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            v-for="[modeId, locale] of Object.entries(modes)"
            :key="modeId"
            @click="
              () => {
                assistantMode = modeId as AssistantMode;
              }
            "
            >{{ locale }}
            <Check v-if="assistantMode == modeId" class="ml-auto" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator orientation="vertical" class="h-4!" />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <InputGroupButton variant="ghost" aria-label="More" size="xs">
            <span class="text-xs">
              {{ uiModels[assistantModel as UIAssistantModel] }}
            </span>
            <ChevronDown />
          </InputGroupButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            v-for="[modelId, locale] of Object.entries(uiModels)"
            :key="modelId"
            :disabled="
              modelId === 'auto-model' &&
              $tachyRouter.routerState.value !== 'success'
            "
            @click="
              () => {
                assistantModel = modelId as UIAssistantModel;
              }
            "
            >{{ locale }}
            <Loader2
              v-if="
                $tachyRouter.routerState.value === 'loading' &&
                modelId === 'auto-model'
              "
              class="size-4 ml-auto animate-spin"
            />
            <Check
              v-if="
                assistantModel == modelId &&
                !(
                  $tachyRouter.routerState.value === 'loading' &&
                  modelId === 'auto-model'
                )
              "
              class="ml-auto"
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <InputGroupButton
        class="rounded-full ml-auto"
        variant="default"
        size="icon-xs"
        :disabled="
          content.length <= 0 ||
          (assistantModel === 'auto-model' &&
            $tachyRouter.routerState.value !== 'success')
        "
        @click="running ? emit('abort') : submit()"
      >
        <Icon v-if="running" name="fluent:stop-16-filled" />
        <ArrowUp v-else />
      </InputGroupButton>
    </InputGroupAddon>
  </InputGroup>
</template>
