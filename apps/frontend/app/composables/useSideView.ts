export type SideView = 'chat' | 'details';

export default function useSideView() {
  const active = useState<boolean>('sideView:active', () => false);
  const view = useState<SideView>('view', () => 'chat');

  return {
    active,
    view,
    toggle(v: SideView) {
      if (view.value === v) {
        return (active.value = !active.value);
      }
      view.value = v;
      active.value = true;
    },
    open(v: SideView) {
      view.value = v;
      active.value = true;
    },
    close() {
      active.value = false;
    },
  };
}
