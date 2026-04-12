import type { ResourceType } from '~/components/detailForms/index.vue';
import useSideView from './useSideView';

export default function useDetailsView() {
  const target = useState<string | null>('details:target', () => null);
  const resource = useState<ResourceType | null>(
    'details:resource',
    () => null
  );

  return {
    target,
    resource,
    open(t: string, res: ResourceType) {
      target.value = t;
      resource.value = res;
      useSideView().open('details');
    },
    close() {
      useSideView().close();
    },
  };
}
