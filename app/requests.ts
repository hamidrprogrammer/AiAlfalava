import type { ChatRequest, ChatReponse } from "./api/openai/typing";
import { Message, ModelConfig, useAccessStore, useChatStore } from "./store";
import { showToast } from "./components/ui-lib";
import axios from "axios";

const TIME_OUT_MS = 30000;

const makeRequestParam = (
  messages: Message[],
  options?: {
    filterBot?: boolean;
    stream?: boolean;
  },
): ChatRequest => {
  let sendMessages = messages.map((v) => ({
    role: v.role,
    content: v.content,
  }));

  if (options?.filterBot) {
    sendMessages = sendMessages.filter((m) => m.role !== "assistant");
  }

  const modelConfig = useChatStore.getState().config.modelConfig;

  return {
    messages: sendMessages,
    stream: options?.stream,
    ...modelConfig,
  };
};

function getHeaders() {
  const accessStore = useAccessStore.getState();
  let headers: Record<string, string> = {};

  if (accessStore.enabledAccessControl()) {
    headers["access-code"] = accessStore.accessCode;
  }

  if (accessStore.token && accessStore.token.length > 0) {
    headers["token"] = accessStore.token;
  }

  return headers;
}

export function requestOpenaiClient(path: string) {
  return (body: any, method = "POST") =>
    fetch("/api/openai?_vercel_no_cache=1", {
      method,
      headers: {
        "Content-Type": "application/json",
        path,
        ...getHeaders(),
      },
      body: body && JSON.stringify(body),
    });
}

export async function requestChat(messages: Message[]) {
  const req: ChatRequest = makeRequestParam(messages, { filterBot: true });
  console.log("[RequestChat] ", req);

  const res = await requestOpenaiClient("v1/chat/completions")(req);

  try {
    const response = (await res.json()) as ChatReponse;
    return response;
  } catch (error) {
    console.error("[Request Chat] ", error, res.body);
  }
}

export async function requestUsage() {
  const formatDate = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  const ONE_DAY = 2 * 24 * 60 * 60 * 1000;
  const now = new Date(Date.now() + ONE_DAY);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDate = formatDate(startOfMonth);
  const endDate = formatDate(now);

  const [used, subs] = await Promise.all([
    requestOpenaiClient(
      `dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`,
    )(null, "GET"),
    requestOpenaiClient("dashboard/billing/subscription")(null, "GET"),
  ]);

  const response = (await used.json()) as {
    total_usage?: number;
    error?: {
      type: string;
      message: string;
    };
  };

  const total = (await subs.json()) as {
    hard_limit_usd?: number;
  };

  if (response.error && response.error.type) {
    showToast(response.error.message);
    return;
  }

  if (response.total_usage) {
    response.total_usage = Math.round(response.total_usage) / 100;
  }

  return {
    used: response.total_usage,
    subscription: total.hard_limit_usd,
  };
}

export async function requestChatStream(
  messages: Message[],
  user:any,
  options?: {
    filterBot?: boolean;
    modelConfig?: ModelConfig;
    onMessage: (message: string, done: boolean) => void;
    onError: (error: Error, statusCode?: number) => void;
    onController?: (controller: AbortController) => void;
  },
) {
  console.log(messages);

  const req = {
    prompt: messages,

  }

  console.log("[Request] ", req);

  const controller = new AbortController();
  const reqTimeoutId = setTimeout(() => controller.abort(), TIME_OUT_MS);

  try {
    const res = await fetch("https://bu-fos-mastermind.solutions-apps.com/ai/prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    
    });
    // clearTimeout(reqTimeoutId);

    let responseText = "";
  

    const finish = () => {
      options?.onMessage(responseText, true);
      
  
      const quizData = {
        messages:messages[messages.length-1].content,
        username:user?.user?.email,
        quizTime:new Date().toISOString(),
        response:responseText,
      };
  
      try {
        const result =  axios.post("https://bu-fos-mastermind.solutions-apps.com/ai/quizzes", quizData);
       
        // Clear the form fields
        
      } catch (error) {
        console.error("Error submitting quiz:", error);
       
      }
      controller.abort();
    };

    if (res.ok) {
      const data = await res.json();
      options?.onMessage(data.content, true);
      const quizData = {
        messages:messages[messages.length-1].content,
        username:"user?.user?.email",
        quizTime:new Date().toISOString(),
        response:data.content,
      };
  
      const result =  axios.post("https://bu-fos-mastermind.solutions-apps.com/ai/quizzes", quizData);
      // const reader = res.body?.getReader();
      // const decoder = new TextDecoder();

      // options?.onController?.(controller);

      // while (true) {
      //   console.log("Now in ChatStream loop");
      //   // handle time out, will stop if no response in 10 secs
      //   const resTimeoutId = setTimeout(() => finish(), TIME_OUT_MS);
      //   const content = await reader?.read();
      //   clearTimeout(resTimeoutId);
      //   const text = decoder.decode(content?.value);
      //   responseText += content?.value;

      //   const done = !content || content.done;
      //   options?.onMessage(responseText, false);

      //   if (done) {
      //     break;
      //   }
      // }

      // finish();
    } else if (res.status === 401) {
      console.error("Unauthorized");
      options?.onError(new Error("Unauthorized"), res.status);
    } else {
      console.error("Stream Error", res.body);
      options?.onError(new Error("Stream Error"), res.status);
    }
  } catch (err) {
    console.error("NetWork Error", err);
    options?.onError(err as Error);
  }
}

export async function requestWithPrompt(messages: Message[], prompt: string) {
  messages = messages.concat([
    {
      role: "user",
      content: prompt,
      date: new Date().toLocaleString(),
    },
  ]);

  const res = await requestChat(messages);

  return res?.choices?.at(0)?.message?.content ?? "";
}

// To store message streaming controller
export const ControllerPool = {
  controllers: {} as Record<string, AbortController>,

  addController(
    sessionIndex: number,
    messageId: number,
    controller: AbortController,
  ) {
    const key = this.key(sessionIndex, messageId);
    this.controllers[key] = controller;
    return key;
  },

  stop(sessionIndex: number, messageId: number) {
    const key = this.key(sessionIndex, messageId);
    const controller = this.controllers[key];
    controller?.abort();
  },

  remove(sessionIndex: number, messageId: number) {
    const key = this.key(sessionIndex, messageId);
    delete this.controllers[key];
  },

  key(sessionIndex: number, messageIndex: number) {
    return `${sessionIndex},${messageIndex}`;
  },
};
