import { EmojiStyle } from "emoji-picker-react";
import { showToast } from "./components/ui-lib";
import Locale from "./locales";

export function trimTopic(topic: string) {
  return topic.replace(/[，。！？”“"、,.!?]*$/, "");
}

export async function copyToClipboard(content: string) {
  // Helper function to check if the content is HTML
  const isHtml = (text) => /<\/?[a-z][\s\S]*>/i.test(text);

  try {
    if (navigator.clipboard && navigator.clipboard.write) {
      if (isHtml(content)) {
        // Copy as HTML and plain text for applications that support it
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([content], { type: "text/html" }),
            "text/plain": new Blob([content], { type: "text/plain" })
          })
        ]);
      } else {
        // Copy as plain text if content has no HTML tags
        await navigator.clipboard.writeText(content);
      }
      showToast(Locale.Copy.Success);
    } else {
      throw new Error("Clipboard API not supported");
    }
  } catch (error) {
    // Fallback for older browsers or failed attempts
    console.warn("Clipboard API failed; falling back to execCommand method:", error);

    const textArea = document.createElement("textarea");
    textArea.value = content;
    textArea.style.position = "fixed";  // Avoid scrolling to bottom
    textArea.style.opacity = "0";       // Make textarea invisible
    document.body.appendChild(textArea);
    textArea.select();

    try {
      if (document.execCommand("copy")) {
        showToast(Locale.Copy.Success);
      } else {
        throw new Error("execCommand failed");
      }
    } catch (execError) {
      console.error("Fallback execCommand failed:", execError);

      showToast("Copying failed. Please manually copy the text.");
    } finally {
      document.body.removeChild(textArea);
    }
  }
}
export async function likeClipboard(text: string,user:any) {
  const feedback = {
    user_id: user?.user?.email,
    response_id: "responseId",
    feedback_type: 'like',
    timestamp: new Date().toISOString(),
    comments: text,
    source: "web_app",
    session_id: "session_example"
};

try {
    const response = await fetch("https://bu-fos-mastermind.solutions-apps.com/ai/feedbackLike", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(feedback),
    });

    const data = await response.json();
    if (data.status === "success") {
        alert("Feedback submitted successfully!");
    } else {
        alert("Error submitting feedback");
    }
} catch (error) {
    console.error("Error:", error);
    alert("Error submitting feedback");
}
}
export async function disLikeClipboard(text: string,user:any) {
  const feedback = {
    user_id: user?.user?.email,
    response_id: "responseId",
    feedback_type: 'dislike',
    timestamp: new Date().toISOString(),
    comments: text,
    source: "web_app",
    session_id: "session_example"
};

try {
    const response = await fetch("https://bu-fos-mastermind.solutions-apps.com/ai/feedbackLike", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(feedback),
    });

    const data = await response.json();
    if (data.status === "success") {
        alert("Feedback submitted successfully!");
    } else {
        alert("Error submitting feedback");
    }
} catch (error) {
    console.error("Error:", error);
    alert("Error submitting feedback");
}
}
export function downloadAs(text: string, filename: string) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text),
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function isIOS() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

export function isMobileScreen() {
  return window.innerWidth <= 600;
}

export function selectOrCopy(el: HTMLElement, content: string) {
  const currentSelection = window.getSelection();

  if (currentSelection?.type === "Range") {
    return false;
  }

  copyToClipboard(content);

  return true;
}

export function queryMeta(key: string, defaultValue?: string): string {
  let ret: string;
  if (document) {
    const meta = document.head.querySelector(
      `meta[name='${key}']`,
    ) as HTMLMetaElement;
    ret = meta?.content ?? "";
  } else {
    ret = defaultValue ?? "";
  }

  return ret;
}

let currentId: string;
export function getCurrentVersion() {
  if (currentId) {
    return currentId;
  }

  currentId = queryMeta("version");

  return currentId;
}

export function getEmojiUrl(unified: string, style: EmojiStyle) {
  return `https://cdn.staticfile.org/emoji-datasource-apple/14.0.0/img/${style}/64/${unified}.png`;
}
