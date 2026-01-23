<script setup lang="ts">
import markdownit, { type Options } from 'markdown-it';
import DOMPurify from 'dompurify';

const props = defineProps<{
  content: string;
  options?: Options;
}>();

const md = markdownit({
  ...props.options,
  breaks: true,
  linkify: true,
  typographer: true,
});

const renderedContent = computed(() => {
  const parsed = md.render(props.content);
  return DOMPurify.sanitize(parsed);
});
</script>

<template>
  <!-- eslint-disable-next-line -->
  <div v-html="renderedContent"></div>
</template>
