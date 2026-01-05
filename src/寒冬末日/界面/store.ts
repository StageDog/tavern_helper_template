import { Schema } from '../schema';

// 完整的初始默认值 - 使用 Schema.parse({}) 会自动应用所有 prefault
const initialData: z.output<typeof Schema> = Schema.parse({});

export const useDataStore = defineStore(
  'data',
  errorCatched(() => {
    const message_id = getCurrentMessageId();

    // 使用完整初始值，而不是空对象
    const data = ref<z.output<typeof Schema>>(initialData);

    const read_stat_data = () => {
      const mvu_data = Mvu.getMvuData({ type: 'message', message_id });
      return Schema.parse(_.get(mvu_data, 'stat_data', {}));
    };

    const refresh_from_mvu = () => {
      try {
        const next = read_stat_data();
        if (!_.isEqual(next, data.value)) data.value = next;
      } catch {
        // ignore
      }
    };

    // 等待 MVU 初始化后读取数据并注册事件
    (async () => {
      await waitGlobalInitialized('Mvu');

      refresh_from_mvu();

      eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, refresh_from_mvu);
      eventOn(Mvu.events.VARIABLE_INITIALIZED, refresh_from_mvu);
    })();

    return { data };
  }),
);
