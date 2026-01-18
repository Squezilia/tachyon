export default function toLocaleDate(date: Date) {
  return date.toLocaleString(navigator.language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
