import { defineMvuDataStore } from '@util/mvu';
import { Schema } from '../../../../角色卡/Run Baby Run/schema';

export const useDataStore = defineMvuDataStore(
  Schema,
  { type: 'message', message_id: getCurrentMessageId() },
  data => {
    // 每次界面初始化时清空系统日志，避免重复处理
    data.value.系统日志 = [];
  },
);
