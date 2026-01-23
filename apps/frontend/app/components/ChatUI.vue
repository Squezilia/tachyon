<script setup lang="ts">
import { ArrowUp, Check, ChevronDown, Plus, X } from 'lucide-vue-next';
import { motion } from 'motion-v';

defineProps<{
  toggle?: boolean;
}>();

const modes = { agent: 'Agent', chat: 'Sohbet', auto: 'Otomatik' };
const models = {
  gpt52: 'GPT-5.2',
  gemini3: 'Gemini 3',
  gpt51: 'GPT-5.1',
  gpt4o: 'GPT-4o',
  gemini25flash: 'Gemini 2.5-flash',
};

const assistantMode = ref<keyof typeof modes>('auto');
const assistantModel = ref<keyof typeof models>('gpt52');

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
</script>

<template>
  <Teleport to="#container">
    <div class="h-[calc(100dvh-7rem)] sticky top-28 z-20">
      <AnimatePresence mode="sync">
        <motion.div
          v-if="toggle"
          :initial="{ width: 0 }"
          :animate="{ width: '24rem' }"
          :exit="{ width: 0 }"
          class="h-full bg-background relative w-96 overflow-hidden"
        >
          <div class="w-96 flex p-2.5 flex-col gap-2.5 h-full">
            <div class="h-full overflow-y-auto"></div>
            <div>
              <InputGroup>
                <InputGroupAddon align="block-start">
                  <ChatContextChip> <Plus /> İçerik Ekle </ChatContextChip>
                  <ChatContextChip
                    v-for="context in contextList"
                    :key="context.id"
                  >
                    <X /> {{ context.name }}
                  </ChatContextChip>
                </InputGroupAddon>
                <InputGroupTextarea placeholder="Mesaj yazın..." />
                <InputGroupAddon align="block-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <InputGroupButton
                        variant="ghost"
                        aria-label="More"
                        size="xs"
                      >
                        <span class="text-xs">
                          {{ modes[assistantMode] }}
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
                            assistantMode = modeId as keyof typeof modes;
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
                      <InputGroupButton
                        variant="ghost"
                        aria-label="More"
                        size="xs"
                      >
                        <span class="text-xs">
                          {{ models[assistantModel] }}
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
                            assistantModel = modelId as keyof typeof models;
                          }
                        "
                        >{{ locale }}
                        <Check
                          v-if="assistantModel == modelId"
                          class="ml-auto"
                        />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <InputGroupButton
                    class="rounded-full ml-auto"
                    variant="default"
                    size="icon-xs"
                  >
                    <ArrowUp />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </Teleport>
</template>
