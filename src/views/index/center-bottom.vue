<script setup lang="ts">
import { ref, nextTick } from "vue";

const DEEPSEEK_API_KEY = "sk-5c99fd1149904937b203f138f161b3f1";
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const AI_DISPLAY_NAME = "青檐智问";
const AI_AVATAR_TEXT = "檐";
const USER_AVATAR_TEXT = "行";
const SOURCE_REFERENCES = `可引用来源编号：
[S1] 国家文物局：全国重点文物保护单位名录/查询系统
[S2] 本平台最新公开源口径（2026-04-03）：全国重点文保总数5061处，古建筑类2170处
[S3] 本平台整理：1911年前民居/官府/皇宫/桥梁四类样本及省级分布
[S4] 本平台研究模型：地级市热力指数（非官方处数）`;
const SYSTEM_PROMPT = `你是一位专业的中国古建筑学专家，精通《营造法式》与历代建筑史。请根据用户提问的意图自动判断回复长度：
- 如果用户使用了"简要""简单""一句话"等词汇，请用50-100字精炼回答。
- 如果用户使用了"详细""深入""展开""介绍"等词汇，请用500-1000字进行专业、系统的详尽阐述。
- 如果用户没有明确指示，请用200-300字给出适中的专业回答。
所有回答上限不超过1000字。请使用专业但易懂的语言。
涉及统计数字时，优先采用以下固定口径：全国重点文保总数5061处、古建筑类2170处、31省区市（最新公开源口径，2026-04-03）。
回答对象必须限定在“1911年前的民居、官府、皇宫、桥梁”四类古建；可以引用1911年后的保护、修缮与研究事件作为背景说明。若用户问题超出对象范围，请先明确超出并给出四类范围内的替代说明。
地图下钻到地级市时展示的是“研究参考热力指数”，不是官方处数统计，请明确说明。
${SOURCE_REFERENCES}
每次回答必须包含以下三段：
【结论】...
【依据来源】使用上述来源编号，如 [S1][S2]
【口径说明】...`;

const chatRef = ref<HTMLElement | null>(null);
const userInput = ref("");
const isLoading = ref(false);

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

const messageList = ref<ChatMessage[]>([
  {
    role: "assistant",
    content:
      "【结论】您好，我是青檐智问，可为您做古建史、营造技术和图表解读。\n\n【依据来源】[S1][S2][S3][S4]\n【口径说明】省级分布以公开整理处数展示；地级市层展示研究参考热力指数（非官方处数）。",
  },
]);

const quickQuestions = [
  "请用30秒讲解山西为何在四类古建样本中指数较高",
  "按“结论-依据来源-口径说明”解释当前地图怎么读",
  "请总结这个平台的三个主要创新点",
  "结合地级市热力，说明它与省级处数有什么区别",
];

const ensureTraceableReply = (text: string) => {
  let reply = (text || "").trim();
  if (!reply) {
    reply = "【结论】抱歉，当前未能生成有效回答，请稍后重试。";
  }
  if (!reply.includes("【结论】")) {
    reply = "【结论】" + reply;
  }
  if (!reply.includes("【依据来源】")) {
    reply += "\n\n【依据来源】[S1][S2][S3][S4]";
  }
  if (!reply.includes("【口径说明】")) {
    reply += "\n【口径说明】省级处数为公开整理，地级市层为研究参考热力指数（非官方处数）。";
  }
  return reply;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight;
  });
};

const sendMessage = async () => {
  const text = userInput.value.trim();
  if (!text || isLoading.value) return;

  messageList.value.push({ role: "user", content: text });
  userInput.value = "";
  isLoading.value = true;
  scrollToBottom();

  try {
    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messageList.value.map((m) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: apiMessages,
      }),
    });

    const data = await res.json();
    const rawReply = data?.choices?.[0]?.message?.content || "抱歉，未能获取回复，请稍后重试。";
    const reply = ensureTraceableReply(rawReply);
    messageList.value.push({ role: "assistant", content: reply });
  } catch (err: any) {
    messageList.value.push({
      role: "assistant",
      content: "网络请求异常，请检查网络连接后重试。",
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

const handleQuickAsk = (question: string) => {
  if (isLoading.value) return;
  userInput.value = question;
  sendMessage();
};
</script>

<template>
  <div class="ai-terminal">
    <!-- Chat area -->
    <div class="chat-area beautify-scroll-def" ref="chatRef">
      <div
        v-for="(msg, i) in messageList"
        :key="i"
        class="chat-row"
        :class="msg.role === 'assistant' ? 'chat-row--ai' : 'chat-row--user'"
      >
        <div class="avatar" :class="msg.role === 'assistant' ? 'avatar--ai' : 'avatar--user'">
          {{ msg.role === "assistant" ? AI_AVATAR_TEXT : USER_AVATAR_TEXT }}
        </div>
        <div class="chat-body">
          <div v-if="msg.role === 'assistant'" class="name-tag">{{ AI_DISPLAY_NAME }}</div>
          <div class="bubble" :class="msg.role === 'assistant' ? 'bubble--ai' : 'bubble--user'">
            {{ msg.content }}
          </div>
        </div>
      </div>
      <!-- Loading indicator -->
      <div v-if="isLoading" class="chat-row chat-row--ai">
        <div class="avatar avatar--ai">{{ AI_AVATAR_TEXT }}</div>
        <div class="chat-body">
          <div class="name-tag">{{ AI_DISPLAY_NAME }}</div>
          <div class="bubble bubble--ai bubble--loading">
            <span class="dot-pulse"></span>
            正在思考...
          </div>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="input-area">
      <div class="quick-ask-wrap">
        <span class="quick-ask-item" v-for="item in quickQuestions" :key="item" @click="handleQuickAsk(item)">
          {{ item }}
        </span>
      </div>
      <div class="input-row">
        <input
          class="chat-input"
          type="text"
          v-model="userInput"
          placeholder="请输入您的古建探索问题..."
          @keydown="handleKeydown"
          :disabled="isLoading"
        />
        <button class="send-btn" :class="{ 'send-btn--disabled': isLoading }" :disabled="isLoading" @click="sendMessage">
          {{ isLoading ? "思考中" : "提问" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-terminal {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* ---- Chat area ---- */
.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 10px 12px 6px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 95%;

  &--ai {
    align-self: flex-start;
  }

  &--user {
    align-self: flex-end;
    flex-direction: row-reverse;
  }
}

.chat-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: calc(100% - 38px);
}

.chat-row--user .chat-body {
  align-items: flex-end;
}

.name-tag {
  font-size: 11px;
  line-height: 1;
  color: rgba(232, 213, 181, 0.62);
  letter-spacing: 0.5px;
  padding-left: 2px;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 900;
  flex-shrink: 0;

  &--ai {
    background: linear-gradient(135deg, #D4A847, #8B5E3C);
    color: #1A1410;
    border: 1px solid rgba(240, 216, 157, 0.45);
    box-shadow: 0 0 8px rgba(201, 169, 110, 0.4);
  }

  &--user {
    background: linear-gradient(135deg, #4F6D5B, #2C4A3A);
    color: #E8D5B5;
    border: 1px solid rgba(157, 197, 168, 0.4);
  }
}

.bubble {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-all;
  white-space: pre-wrap;

  &--ai {
    background: rgba(26, 20, 16, 0.7);
    border: 1px solid rgba(201, 169, 110, 0.25);
    color: #F5F0E8;
  }

  &--user {
    background: rgba(59, 89, 152, 0.35);
    border: 1px solid rgba(59, 89, 152, 0.3);
    color: #F5F0E8;
  }

  &--loading {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(232, 213, 181, 0.6);
    font-style: italic;
  }
}

.dot-pulse {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #D4A847;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* ---- Input area ---- */
.input-area {
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  display: flex;
  padding: 8px 12px 10px;
  border-top: 1px solid rgba(201, 169, 110, 0.15);
  flex-shrink: 0;
}

.quick-ask-wrap {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.quick-ask-item {
  font-size: 11px;
  line-height: 1.2;
  color: rgba(232, 213, 181, 0.72);
  border: 1px solid rgba(201, 169, 110, 0.24);
  background: rgba(26, 20, 16, 0.28);
  border-radius: 10px;
  padding: 2px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-ask-item:hover {
  color: #F0D89D;
  border-color: rgba(212, 168, 71, 0.6);
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-input {
  flex: 1;
  height: 34px;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(201, 169, 110, 0.5);
  color: #F5F0E8;
  font-size: 13px;
  outline: none;
  padding: 0 4px;
  transition: border-color 0.3s;

  &::placeholder {
    color: rgba(232, 213, 181, 0.4);
  }

  &:focus {
    border-bottom-color: #D4A847;
  }

  &:disabled {
    opacity: 0.5;
  }
}

.send-btn {
  flex-shrink: 0;
  height: 34px;
  padding: 0 20px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #8C4356, #C04851);
  color: #F5F0E8;
  font-size: 13px;
  font-weight: bold;
  letter-spacing: 2px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.3s;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120%;
    height: 120%;
    transform: translate(-50%, -50%);
    border-radius: inherit;
    background: radial-gradient(circle, rgba(212, 168, 71, 0.2) 0%, transparent 70%);
    animation: breathe 2.5s ease-in-out infinite;
    pointer-events: none;
  }

  &:hover {
    box-shadow: 0 0 12px rgba(192, 72, 81, 0.5);
  }

  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;

    &::before {
      animation: none;
    }
  }
}

@keyframes breathe {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(0.9);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
}
</style>
