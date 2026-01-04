import { Schema } from '../schema';

// 完整的初始默认值 - 使用 Schema.parse({}) 会自动应用所有 prefault
const initialData: z.output<typeof Schema> = Schema.parse({
  世界: {
    地址: '',
    日期: '',
    时间: '',
    末日天数: 0,
  },
  庇护所: {
    庇护所等级: 1,
    今日投掷点数: '',
    距离上次升级: '',
    庇护所能力: [],
    可扩展区域: {
      医疗翼: '未解锁',
      制造工坊: '未解锁',
      载具格纳库: '未解锁',
    },
  },
  房间: {
    玄关: {
      临时客房A入住者: [],
      临时客房B入住者: [],
    },
    核心区: {
      主卧室使用者: [],
      主浴室使用者: [],
    },
    楼层房间: {
      楼层20房间: {},
      楼层19房间: {},
    },
  },
  主线任务: {
    当前阶段: '阶段一：秩序的萌芽',
    阶段目标: [],
    目标完成状态: {},
    情报碎片: {},
  },
});

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

    watchDebounced(
      data,
      new_data => {
        const parsed = Schema.parse(new_data);
        if (!_.isEqual(parsed, new_data)) {
          data.value = parsed;
        }

        updateVariablesWith(
          variables => {
            _.set(variables, 'stat_data', parsed);
            return variables;
          },
          { type: 'message', message_id },
        );
      },
      { deep: true, debounce: 500 },
    );

    return { data };
  }),
);
