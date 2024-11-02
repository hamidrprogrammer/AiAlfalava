import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import RemarkMath from "remark-math";
import RemarkBreaks from "remark-breaks";
import RehypeKatex from "rehype-katex";
import RemarkGfm from "remark-gfm";
import RehypeHighlight from "rehype-highlight";
import { useRef, useState, RefObject, useEffect } from "react";
import { copyToClipboard } from "../utils";
import rehypeRaw from 'rehype-raw'; // Add this to handle raw HTML
import DOMPurify from "dompurify";
import { marked } from "marked";
import  mark from "../icons/bot.svg";

import he from "he";
import { ChatItem } from "@lobehub/ui";
export function PreCode(props: { children: any }) {
  const ref = useRef<HTMLPreElement>(null);

  return (
    <pre ref={ref}>
      <span
        className="copy-code-button"
        onClick={() => {
          if (ref.current) {
            const code = ref.current.innerText;
            copyToClipboard(code);
          }
        }}
      ></span>
      {props.children}
    </pre>
  );
}
import  avatar from '../icons/bot.svg';

const useLazyLoad = (ref: RefObject<Element>): boolean => {
  const [isIntersecting, setIntersecting] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIntersecting(true);
        observer.disconnect();
      }
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return isIntersecting;
};

export function Markdown(props: { content: string }) {
  const cleanText = (text) => {
    return text.replace(/\s+/g, ' ').trim();
};
function formatTextToMarkdown(rawText) {
  // Remove excessive spaces
  const cleanedText = rawText.replace(/\s+/g, ' ').trim();

  // Split the text into lines
  const lines = cleanedText.split('\n');

  // Prepare formatted lines
  const formattedLines = lines.map(line => {
      // Convert headings (e.g., "## Heading")
      if (line.startsWith('##')) {
          return line.replace(/^#+/, (match) => `${'#'.repeat(match.length)} `);
      }
      // Convert bullet points (e.g., "- Item")
      else if (line.startsWith('-')) {
          return `- ${line.slice(1).trim()}`;
      }
      // Convert numbered list (e.g., "1. Item")
      else if (/^\d+\.\s/.test(line)) {
          return line.replace(/^(\d+\.\s)/, `$1 `);
      }
      // Return regular text
      return line;
  });

  // Join the formatted lines back together
  return formattedLines.join('\n');
}

  return (
   

    <ReactMarkdown
      remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
      rehypePlugins={[
        RehypeKatex,
        [
          RehypeHighlight,
          {
            detect: true,   // Disable auto-detection of language
            ignoreMissing: false,  // Ignore errors for unsupported languages
          },
        ],
        rehypeRaw, // This allows rendering of raw HTML inside markdown
      ]}
      components={{
        pre: PreCode,
      }}

    >
  
     {props.content }
    </ReactMarkdown>
  );
}
