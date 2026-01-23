<script setup lang="ts">
import { ArrowUp, Check, ChevronDown, Plus, X } from 'lucide-vue-next';
import type { PropType } from 'vue';

defineProps<{
  toggle?: boolean;
}>();

const modes = { agent: 'Agent', chat: 'Sohbet', auto: 'Otomatik' };
const models = {
  gemini3: 'Gemini 3',
  gemini25flash: 'Gemini 2.5-flash',
};

export type AssistantMode = keyof typeof modes;
export type AssistantModel = keyof typeof models;

const assistantMode = defineModel('mode', {
  type: String as PropType<AssistantMode>,
  default: 'auto',
  required: true,
});
const assistantModel = defineModel('model', {
  type: String as PropType<AssistantModel>,
  default: 'gemini25flash',
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
}>();

const content = ref('');

function submit(ev: KeyboardEvent) {
  if (ev.shiftKey) return;
  if (content.value.trim().length < 1) return;
  emit('submit', content.value);
  content.value = '';
  ev.preventDefault();
}
</script>

<template>
  <InputGroup>
    <InputGroupAddon align="block-start">
      <ChatContextChip> <Plus /> İçerik Ekle </ChatContextChip>
      <ChatContextChip v-for="context in contextList" :key="context.id">
        <X /> {{ context.name }}
      </ChatContextChip>
    </InputGroupAddon>
    <InputGroupTextarea
      v-model="content"
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
              {{ models[assistantModel as AssistantModel] }}
            </span>
            <ChevronDown />
          </InputGroupButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            v-for="[modelId, locale] of Object.entries(models)"
            :key="modelId"
            @click="
              () => {
                assistantModel = modelId as AssistantModel;
              }
            "
            >{{ locale }}
            <Check v-if="assistantModel == modelId" class="ml-auto" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <InputGroupButton
        class="rounded-full ml-auto"
        variant="default"
        size="icon-xs"
        @click="submit"
      >
        <ArrowUp />
      </InputGroupButton>
    </InputGroupAddon>
  </InputGroup>
</template>
