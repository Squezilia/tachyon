export default function shortenName(name: string) {
  const splitted = name.split(' ');
  if (splitted.length > 1) {
    return splitted.reduce((b, c) => {
      return b[0] || '' + c[0] || '';
    });
  }
  return (splitted[0] || '')[0] || '';
}
