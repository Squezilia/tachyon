<script setup lang="ts">
import markdownit, { type Options } from 'markdown-it';
// import DOMPurify from 'dompurify';
import mk from '@vscode/markdown-it-katex';
// @ts-expect-error no @types package generated
import sub from 'markdown-it-sub';
import footnote from 'markdown-it-footnote';
// @ts-expect-error no @types package generated
import tasks from 'markdown-it-task-lists';
import { full } from 'markdown-it-emoji';
import anchor from 'markdown-it-anchor';
import container from 'markdown-it-container';

const props = defineProps<{
  content: string;
  options?: Options;
}>();

const md = markdownit({
  ...props.options,
  breaks: true,
  linkify: true,
  typographer: true,
  quotes: '„“‚‘',
})
  .use(anchor)
  .use(full)
  .use(mk)
  .use(sub)
  .use(footnote)
  .use(tasks)
  .use(container);

const renderedContent = computed(() => {
  const parsed = md.render(props.content);
  return parsed;
});
</script>

<template>
  <!-- eslint-disable-next-line -->
  <div v-html="renderedContent" class="markdown space-y-3"></div>
</template>
