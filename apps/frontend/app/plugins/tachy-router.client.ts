import {
  AutoModelForSequenceClassification,
  AutoTokenizer,
  PreTrainedModel,
  PreTrainedTokenizer,
  softmax,
} from '@huggingface/transformers';
import {
  AssistantModel,
  UIAssistantModel,
} from '~/components/assistant/InputBox.vue';

const MODEL = 'Squezilia/tachyon-router-v1-mini';
const LABEL_NAMES = {
  0: 'trivial',
  1: 'simple',
  2: 'analysis',
  3: 'complex',
} as const;
type LabelNames = typeof LABEL_NAMES;
type LabelKeys = keyof LabelNames;
type Labels = LabelNames[LabelKeys];
const CONF_THRESHOLD = 0.65;

type RouterState = 'fail' | 'success' | 'loading';

const ModelLabelMapping: Record<Labels, AssistantModel> = {
  analysis: 'gemini-3-pro-preview',
  complex: 'gemini-3-flash-preview',
  simple: 'gemini-2.5-flash',
  trivial: 'gemini-2.5-flash-lite',
};

export default defineNuxtPlugin({
  name: 'assistant',
  parallel: true,
  async setup(app) {
    const routerState = useState<RouterState>(
      'assistant:routerState',
      () => 'loading'
    );
    const routerModel = ref<PreTrainedModel | null>(null);
    const routerTokenizer = ref<PreTrainedTokenizer | null>(null);

    new Promise(async () => {
      const res = await Promise.all([
        AutoModelForSequenceClassification.from_pretrained(MODEL, {
          subfolder: 'onnx_fp16',
          dtype: 'fp16',
          device: 'wasm',
        }),
        AutoTokenizer.from_pretrained(MODEL, {}),
      ]).catch((err) => {
        console.error(err);
        routerState.value = 'fail';
      });

      if (!res) return;

      const [downloadedModel, downloadedTokenizer] = res;

      routerModel.value = downloadedModel;
      routerTokenizer.value = downloadedTokenizer;
      routerState.value = 'success';
    });

    return {
      provide: {
        tachyRouter: {
          routerState,
          history,
          async evalRouter(text: string) {
            if (
              !routerTokenizer.value ||
              !routerModel.value ||
              routerState.value !== 'success'
            )
              return;

            const inputs = await routerTokenizer.value(text, {
              padding: true,
              truncation: true,
              maxLength: 128,
            });

            const { logits } = await routerModel.value(inputs);

            const probs = softmax(logits.data);

            let pred = 0;
            let conf = 0;
            for (let i = 0; i < probs.length; i++) {
              if (probs[i] > conf) {
                conf = probs[i];
                pred = i;
              }
            }

            if (conf < CONF_THRESHOLD && pred < 3) {
              pred += 1;
            }

            return {
              label: pred as LabelKeys,
              label_name: LABEL_NAMES[
                pred as keyof typeof LABEL_NAMES
              ] as Labels,
              confidence: conf as number,
            };
          },
          async route(message: string, modelName: UIAssistantModel) {
            if (
              !routerTokenizer.value ||
              !routerModel.value ||
              routerState.value !== 'success'
            )
              return;

            let inferenceModelName: AssistantModel = 'gemini-2.5-flash-lite';

            if (modelName === 'auto-model') {
              const result = await this.evalRouter(message);
              console.log(result);
              if (!result) return;
              inferenceModelName = ModelLabelMapping[result.label_name];
            } else {
              inferenceModelName = modelName;
            }

            return inferenceModelName;
          },
        },
      },
    };
  },
});
