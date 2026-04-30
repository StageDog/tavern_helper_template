import { defineMvuDataStore } from '@util/mvu';
import { Schema } from '../../../../角色卡/Run Baby Run/schema';

export const useDataStore = defineMvuDataStore(
  Schema,
  { type: 'message', message_id: getCurrentMessageId() },
  data => {
    // 仅当这个前端界面属于「最新 AI 楼层」时，清空系统日志
    // 这样日志只记录当前楼层的玩家操作，不会被带到下一层
    const currentMessageId = getCurrentMessageId();
    const latestMessageId = getLastMessageId();
    const currentMessage = getChatMessages(currentMessageId)[0];
    const isLatestAssistantMessage = currentMessageId === latestMessageId && currentMessage?.role === 'assistant';

    const hasStatData = _.has(getVariables({ type: 'message', message_id: currentMessageId }), 'stat_data');
    if (isLatestAssistantMessage && hasStatData && data.value.系统日志.length > 0) {
      data.value.系统日志 = [];
      updateVariablesWith(
        variables => {
          _.set(variables, 'stat_data.系统日志', []);
          return variables;
        },
        { type: 'message', message_id: currentMessageId },
      );
    }
  },
);
