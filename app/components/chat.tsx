import { useDebouncedCallback } from "use-debounce";
import { memo, useState, useRef, useEffect, useLayoutEffect } from "react";
import axios from "axios";

import SendWhiteIcon from "../icons/send-white.svg";
import Upload from "../icons/upload.svg";
import FileSvg from "../icons/file-remove-svgrepo-com.svg";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BrainIcon from "../icons/brain.svg";
import ExportIcon from "../icons/export.svg";
import ReturnIcon from "../icons/return.svg";
import CopyIcon from "../icons/copy.svg";
import DownloadIcon from "../icons/download.svg";
import LoadingIcon from "../icons/three-dots.svg";
import BotIcon from "../icons/bot.svg";
import UserIcon from "../icons/user-svg.svg"; //Use this for user avatar instead of emoji
import AddIcon from "../icons/add.svg";
import DeleteIcon from "../icons/delete.svg";
import { ActionIcon, ChatInputActionBar, ChatInputArea, ChatSendButton, DraggablePanel, FileTypeIcon, TokenTag } from '@lobehub/ui';
import {
  Message,
  SubmitKey,
  useChatStore,
  BOT_HELLO,
  ROLES,
  createMessage,
} from "../store";

import {
  copyToClipboard,
  disLikeClipboard,
  downloadAs,
  getEmojiUrl,
  isMobileScreen,
  likeClipboard,
  selectOrCopy,
} from "../utils";

import dynamic from "next/dynamic";

import { ControllerPool } from "../requests";
import { Prompt, usePromptStore } from "../store/prompt";
import Locale from "../locales";

import { IconButton } from "./button";
import styles from "./home.module.scss";
import chatStyle from "./chat.module.scss";

import { Input, Modal, showModal, showToast } from "./ui-lib";
import Image from "next/image";
import { Flexbox } from "react-layout-kit";
import { Eraser, FileUpIcon, Languages, ThumbsDown, ThumbsUp } from "lucide-react";
import { useSession } from "next-auth/react";

const Markdown = dynamic(
  async () => memo((await import("./markdown")).Markdown),
  {
    loading: () => <LoadingIcon />,
  },
);

const Emoji = dynamic(async () => (await import("emoji-picker-react")).Emoji, {
  loading: () => <LoadingIcon />,
});

export function Avatar(props: { role: Message["role"], data: any }) {
  const config = useChatStore((state) => state.config);

  if (props.role !== "user") {
    return <BotIcon className={styles["user-avtar"]} />;
  }

  return <>
    {
      props.data?.user?.image ? (
        <Image
          src={props.data?.user?.image}
          alt="User Profile"
          objectFit="cover"
          width={50}  // Set width as needed
          height={50} // Set height as needed
          style={{ borderRadius: 100, top: 50 }}
        />
      ) : (
        <UserIcon className={styles["user-avtar"]} />
      )

    }</>

  // return (
  //   <div className={styles["user-avtar"]}>
  //     <Emoji unified={config.avatar} size={18} getEmojiUrl={getEmojiUrl} />
  //   </div>
  // );
}

function exportMessages(messages: Message[], topic: string) {
  const mdText =
    `# ${topic}\n\n` +
    messages
      .map((m) => {
        return m.role === "user"
          ? `## ${Locale.Export.MessageFromYou}:\n${m.content}`
          : `## ${Locale.Export.MessageFromChatGPT}:\n${m.content.trim()}`;
      })
      .join("\n\n");
  const filename = `${topic}.pdf`;

  showModal({
    title: Locale.Export.Title,
    children: (
      <div className="markdown-body">
        <pre className={styles["export-content"]}>{mdText}</pre>
      </div>
    ),
    actions: [
      <IconButton
        key="copy"
        icon={<CopyIcon />}
        bordered
        text={Locale.Export.Copy}
        onClick={() => {
          
          copyToClipboard(mdText)}}
      />,
      <IconButton
        key="download"
        icon={<DownloadIcon />}
        bordered
        text={Locale.Export.Download}
        onClick={() => downloadAs(mdText, filename)}
      />,
    ],
  });
}

function PromptToast(props: {
  showToast?: boolean;
  showModal?: boolean;
  response?: string;
  refrence?: string;
  setShowModal: (_: boolean) => void;
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const context = session.context;

  const addContextPrompt = (prompt: Message) => {
    chatStore.updateCurrentSession((session) => {
      session.context.push(prompt);
    });
  };

  const removeContextPrompt = (i: number) => {
    chatStore.updateCurrentSession((session) => {
      session.context.splice(i, 1);
    });
  };

  const updateContextPrompt = (i: number, prompt: Message) => {
    chatStore.updateCurrentSession((session) => {
      session.context[i] = prompt;
    });
  };
  const { data: sessionUser, status, update } = useSession();

  const handleSubmit = async () => {


    const feedbackData = {
      name:sessionUser?.user?.name,
      username:sessionUser?.user?.email,
      message,
      response:props?.response,
      reference:props?.refrence,
      timestamp: new Date().toISOString(),
      accept :false
    };

    try {
      const response = await axios.post("https://bu-fos-mastermind.solutions-apps.com/ai/feedbacks", feedbackData);
      toast("Your feedback was successfully sent!")
      console.log("Feedback response:", response.data);
      // Clear the form
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast('Failed to submit feedback. Please try again."')

    }
  };
  const [message, setMessage] = useState("");

  return (
    <div className={chatStyle["prompt-toast"]} key="prompt-toast">
      {/* {props.showToast && (
        <div
          className={chatStyle["prompt-toast-inner"] + " clickable"}
          role="button"
          onClick={() => props.setShowModal(true)}
        >
          <BrainIcon />
          <span className={chatStyle["prompt-toast-content"]}>
            {Locale.Context.Toast(context.length)}
          </span>
        </div>
      )} */}
      {props.showModal && (
        <div className="modal-mask">
          <Modal
            title={"Feedback"}
            onClose={() => props.setShowModal(false)}

          >
            <>
              <div className={chatStyle["context-prompt"]}>

                <div className={chatStyle["context-prompt-row"]} >

                  <Input
                    type="text"
                    className={chatStyle["context-content"]}
                    rows={1}
                    onInput={(e)=>{setMessage(e.currentTarget.value)}}

                  />
                  {/* <IconButton
                      icon={<DeleteIcon />}
                      className={chatStyle["context-delete-button"]}
                      onClick={() => removeContextPrompt(i)}
                      bordered
                    /> */}
                </div>


                <div className={chatStyle["context-prompt-row"]}>
                  <IconButton
                    icon={<AddIcon />}
                    text={"Send feedback"}
                    bordered
                    className={chatStyle["context-prompt-button"]}
                    onClick={() => {
                      handleSubmit();
                    
                      props.setShowModal(false)
                    }
                    }
                  />
                </div>
              </div>
              <div className={chatStyle["memory-prompt"]}>
                <div className={chatStyle["memory-prompt-title"]}>
                  <span>
                    {'Your feedback'} ({session.lastSummarizeIndex} of{" "}
                    {session.messages.length})
                  </span>


                </div>
                <div className={chatStyle["memory-prompt-content"]}>
                  {session.memoryPrompt || Locale.Memory.EmptyContent}
                </div>
              </div>
            </>
          </Modal>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

function useSubmitHandler() {
  const config = useChatStore((state) => state.config);
  const submitKey = config.submitKey;

  const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return false;
    if (e.key === "Enter" && e.nativeEvent.isComposing) return false;
    return (
      (config.submitKey === SubmitKey.AltEnter && e.altKey) ||
      (config.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
      (config.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
      (config.submitKey === SubmitKey.MetaEnter && e.metaKey) ||
      (config.submitKey === SubmitKey.Enter &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.metaKey)
    );
  };

  return {
    submitKey,
    shouldSubmit,
  };
}

export function PromptHints(props: {
  prompts: Prompt[];
  onPromptSelect: (prompt: Prompt) => void;
}) {
  if (props.prompts.length === 0) return null;

  return (
    <div className={styles["prompt-hints"]}>
      {props.prompts.map((prompt, i) => (
        <div
          className={styles["prompt-hint"]}
          key={prompt.title + i.toString()}
          onClick={() => props.onPromptSelect(prompt)}
        >
          <div className={styles["hint-title"]}>{prompt.title}</div>
          <div className={styles["hint-content"]}>{prompt.content}</div>
        </div>
      ))}
    </div>
  );
}

function useScrollToBottom() {
  // for auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // auto scroll
  useLayoutEffect(() => {
    const dom = scrollRef.current;
    if (dom && autoScroll) {
      setTimeout(() => (dom.scrollTop = dom.scrollHeight), 1);
    }
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
  };
}

export function Chat(props: {
  showSideBar?: () => void;
  sideBarShowing?: boolean;
  user: any
}) {
  type RenderMessage = Message & { preview?: boolean };

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);
  const fontSize = useChatStore((state) => state.config.fontSize);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [beforeInput, setBeforeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { submitKey, shouldSubmit } = useSubmitHandler();
  const { scrollRef, setAutoScroll } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(false);

  const onChatBodyScroll = (e: HTMLElement) => {
    const isTouchBottom = e.scrollTop + e.clientHeight >= e.scrollHeight - 20;
    setHitBottom(isTouchBottom);
  };

  // prompt hints
  const promptStore = usePromptStore();
  const [promptHints, setPromptHints] = useState<Prompt[]>([]);
  const onSearch = useDebouncedCallback(
    (text: string) => {
      setPromptHints(promptStore.search(text));
    },
    100,
    { leading: true, trailing: true },
  );

  const onPromptSelect = (prompt: Prompt) => {
    setUserInput(prompt.content);
    setPromptHints([]);
    inputRef.current?.focus();
  };

  const scrollInput = () => {
    const dom = inputRef.current;
    if (!dom) return;
    const paddingBottomNum: number = parseInt(
      window.getComputedStyle(dom).paddingBottom,
      10,
    );
    dom.scrollTop = dom.scrollHeight - dom.offsetHeight + paddingBottomNum;
  };

  // only search prompts when user input is short
  const SEARCH_TEXT_LIMIT = 30;
  const onInput = (text: string) => {
    scrollInput();
    setUserInput(text);
    const n = text.trim().length;

    // clear search results
    if (n === 0) {
      setPromptHints([]);
    } else if (!chatStore.config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
      // check if need to trigger auto completion
      if (text.startsWith("/")) {
        let searchText = text.slice(1);
        if (searchText.length === 0) {
          searchText = " ";
        }
        onSearch(searchText);
      }
    }
  };
  const { data: sessionUser, status, update } = useSession();

  // submit user input
  const onUserSubmit = () => {
    if (userInput.length <= 0) return;
    setIsLoading(true);
    chatStore.onUserInput(userInput,sessionUser).then(() => setIsLoading(false));

    chatStore.editedSessionSendEnter(userInput)
    setBeforeInput(userInput);
    setUserInput("");
    setPromptHints([]);
    if (!isMobileScreen()) inputRef.current?.focus();
    setAutoScroll(true);
  };
  const [selectedFile, setSelectedFile] = useState(null);
  const [base64, setBase64] = useState('');
  const fileInputRef = useRef(null); // Reference to the hidden file input

  const handleFileClick = () => {
    fileInputRef.current.click(); // Trigger the hidden file input click
  };
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setBase64('');
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  // const handleConvertToBase64 = () => {
  //   if (selectedFile) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       const imgBase64 = reader.result.split(',')[1]; // Extract base64 part
  //       const mimeType = selectedFile.type; // Get the correct MIME type
  //       const imgStr = `data:${mimeType};base64,${imgBase64}`;
  //       setBase64(imgStr);
  //     };
  //     reader.readAsDataURL(selectedFile);
  //   } else {
  //     alert('Please select a valid file first.');
  //   }
  // };

  // stop response
  const onUserStop = (messageId: number) => {
    ControllerPool.stop(sessionIndex, messageId);
  };

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if ArrowUp and no userInput
    if (e.key === "ArrowUp" && userInput.length <= 0) {
      setUserInput(beforeInput);
      e.preventDefault();
      return;
    }
    if (shouldSubmit(e)) {
      onUserSubmit();
      e.preventDefault();
    }
  };
  const onRightClick = (e: any, message: Message) => {
    // auto fill user input
    if (message.role === "user") {
      setUserInput(message?.content);
    }

    // copy to clipboard
    if (selectOrCopy(e.currentTarget, message?.content)) {
      e.preventDefault();
    }
  };

  const onResend = (botIndex: number) => {
    // find last user input message and resend
    for (let i = botIndex; i >= 0; i -= 1) {
      if (messages[i].role === "user") {
        setIsLoading(true);
        // chatStore
        //   .onUserInput(messages[i].content)
        //   .then(() => setIsLoading(false));
        chatStore.updateCurrentSession((session) =>
          session.messages.splice(i, 2),
        );
        inputRef.current?.focus();
        return;
      }
    }
  };

  const config = useChatStore((state) => state.config);

  const context: RenderMessage[] = session?.context?.slice() || [];

  if (
    context.length === 0 &&
    session.messages.at(0)?.content !== BOT_HELLO.content
  ) {
    context.push(BOT_HELLO);
  }

  // preview messages
  const messages = context
    .concat(session.messages as RenderMessage[])
    .concat(
      isLoading
        ? [
          {
            ...createMessage({
              role: "assistant",
              content: "……",
            }),
            preview: true,
          },
        ]
        : [],
    )
    .concat(
      userInput.length > 0 && config.sendPreviewBubble
        ? [
          {
            ...createMessage({
              role: "user",
              content: userInput,
            }),
            preview: true,
          },
        ]
        : [],
    );

  const [showPromptModal, setShowPromptModal] = useState(false);
  const [reference, setReference] = useState('');
  const [response, setResponse] = useState('');

  // Auto focus
  useEffect(() => {
    if (props.sideBarShowing && isMobileScreen()) return;
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.chat} key={session.id} style={{backgroundColor:"#F8F8F8"}}>
      <div className={styles["window-header"]}>
        <div className={styles["window-header-title"]}>
          <div
            className={`${styles["window-header-main-title"]} ${styles["chat-body-title"]}`}
            onClickCapture={() => {
              const newTopic = prompt(Locale.Chat.Rename, session.topic);
              if (newTopic && newTopic !== session.topic) {
                chatStore.updateCurrentSession(
                  (session) => (session.topic = newTopic!),
                );
              }
            }}
          >
            {session.messages.length > 0 ? session.messages[0].content : session.topic}
          </div>
          <div className={styles["window-header-sub-title"]}>
            {Locale.Chat.SubTitle(session.messages.length)}
          </div>
        </div>
        <div className={styles["window-actions"]}>
          <div className={styles["window-action-button"] + " " + styles.mobile}>
            <IconButton
              icon={<ReturnIcon />}
              bordered
              title={Locale.Chat.Actions.ChatList}
              onClick={props?.showSideBar}
            />
          </div>
          {/* <div className={styles["window-action-button"]}>
            <IconButton
              icon={<BrainIcon />}
              bordered
              title={"feedback"}
              onClick={() => {
                setShowPromptModal(true);
              }}
            />
          </div> */}
          <div className={styles["window-action-button"]}>
            <IconButton
              icon={<ExportIcon />}
              bordered
              title={Locale.Chat.Actions.Export}
              onClick={() => {
                exportMessages(
                  session.messages.filter((msg) => !msg.isError),
                  session.topic,
                );
              }}
            />
          </div>
        </div>

        <PromptToast
          showToast={!hitBottom}
          showModal={showPromptModal}
          refrence ={reference}
          response={response}
          setShowModal={setShowPromptModal}
        />
      </div>

      <div
        className={styles["chat-body"]}
        ref={scrollRef}
        onScroll={(e) => onChatBodyScroll(e.currentTarget)}
        onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        {messages.map((message, i) => {
          const isUser = message.role === "user";

          return (
            <div
              key={i}
              className={
                isUser ? styles["chat-message-user"] : styles["chat-message"]
              }
            >
              <div className={styles["chat-message-container"]}>
                <div className={styles["chat-message-avatar"]}>

                  <Avatar role={message.role} data={props.user} />
                </div>
                {(message.preview || message.streaming) && (
                  <div className={styles["chat-message-status"]}>
                    {Locale.Chat.Typing}
                  </div>
                )}
                <div className={styles["chat-message-item"]}>
                  {!isUser &&
                    !(message.preview || message?.content?.length === 0) && (
                      <div className={styles["chat-message-top-actions"]}>
                        {message.streaming ? (
                          <div
                            className={styles["chat-message-top-action"]}
                            onClick={() => onUserStop(message.id ?? i)}
                          >
                            {Locale.Chat.Actions.Stop}
                          </div>
                        ) : (
                          <div
                            className={styles["chat-message-top-action"]}
                            onClick={() => onResend(i)}
                          >
                            {Locale.Chat.Actions.Retry}
                          </div>
                        )}

                        <div
                          className={styles["chat-message-top-action"]}
                          onClick={() => copyToClipboard(message?.content)}
                        >
                          {Locale.Chat.Actions.Copy}
                        </div>
                        <div
                          className={styles["chat-message-top-action"]}
                          onClick={() =>{
                            const index = messages.findIndex(me => me.content === message?.content);
                            console.log(index);
                            console.log(message?.content);
                           
                          
                            if (index > 0) {
                              const data =  messages[index - 1]; 
                              likeClipboard(message?.content,props.user,data?.content,message?.content)
                              
                               // Return the previous message
                          } 

                            }}
                        >
                               <ThumbsDown size={15}/>
                        </div>
                        <div
                          className={styles["chat-message-top-action"]}
                          onClick={() => {
                            const index = messages.findIndex(me => me.content === message?.content);
                            console.log(index);
                            console.log(message?.content);
                           
                          
                            if (index > 0) {
                              const data =  messages[index - 1]; 
                              disLikeClipboard(message?.content,props.user,data?.content,message?.content)
                              
                               // Return the previous message
                          } 
                           
                          }}
                        >
                          <ThumbsUp size={15}/>
                        </div>
                        <div
                          className={styles["chat-message-top-action"]}
                          onClick={() => {
                            setShowPromptModal(true)
                            const index = messages.findIndex(me => me.content === message?.content);
                            console.log(index);
                            console.log(message?.content);
                            setResponse(message?.content)
                          
                            if (index > 0) {
                              const data =  messages[index - 1]; 
                              setReference(data?.content)
                               // Return the previous message
                          } 
                          setShowPromptModal(true)

                           
                            

                            // if(message?.content)
                            // setReference(messages[messages?.length-2]?.content)
                            // setReference(messages[messages?.length-2]?.content)

                           
                          }}
                        >
                          <BrainIcon size={15}/>
                        </div>
                      </div>
                    )}
                  {(message.preview || message?.content?.length === 0) &&
                    !isUser ? (
                    <LoadingIcon />
                  ) : (
                    <div
                      className="markdown-body"
                      style={{ fontSize: `${fontSize}px` }}
                      onContextMenu={(e) => onRightClick(e, message)}
                      onDoubleClickCapture={() => {
                        if (!isMobileScreen()) return;
                        setUserInput(message?.content);
                      }}
                    >
                      <Markdown content={message?.content} />
                    </div>
                  )}
                </div>
                {!isUser && !message.preview && (
                  <div className={styles["chat-message-actions"]}>
                    <div className={styles["chat-message-action-date"]}>
                      {message.date.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles["chat-input-panel"]}>
        <PromptHints prompts={promptHints} onPromptSelect={onPromptSelect} />
        <DraggablePanel placement={"bottom"}        >
        <Flexbox style={{ height: 180, position: 'relative' }}>
      <div style={{ flex: 1 }}></div>
      <ChatInputArea
                  autoFocus={!props?.sideBarShowing}
                  onInput={(e) => onInput(e)}
                  value={userInput}
                  style={{paddingLeft:200}}
                  
                  placeholder={Locale.Chat.Input(submitKey)}
                  onSend={onUserSubmit}



        bottomAddons={
        
        <ChatSendButton               onSend={onUserSubmit}
        />
       
       }
        

        topAddons={
          <ChatInputActionBar
            leftAddons={
              <>
                <ActionIcon icon={FileUpIcon} onClick={() => { handleFileClick() }}/>
                <ActionIcon icon={Eraser} onClick={() => { onInput('')}}/>
                <TokenTag maxValue={5000} value={1000} />
                {selectedFile && (
                <FileTypeIcon 
        color="#f54838"
        size={50}
        onClick={() => { handleRemoveFile() }}

        
                  filetype="png/jpg"/>
                )}
                <input
              type="file"
              ref={fileInputRef}
              accept=".png,.jpg,.jpeg"
              style={{ display: 'none' }} // Hide the file input
              onChange={handleFileChange}
            />
                

              </>
            }
          />
        }
      />
    </Flexbox>
    </DraggablePanel>
        {/* <div className={styles["chat-input-panel-inner"]}>
          <textarea
            ref={inputRef}
            className={styles["chat-input"]}
            placeholder={Locale.Chat.Input(submitKey)}
            rows={2}
            onInput={(e) => onInput(e.currentTarget.value)}
            value={userInput}
            onKeyDown={onInputKeyDown}
            onFocus={() => setAutoScroll(true)}
            onBlur={() => {
              setAutoScroll(false);
              setTimeout(() => setPromptHints([]), 500);
            }}
            autoFocus={!props?.sideBarShowing}
          />
          <div className={styles["rowhamid"]}>
            <IconButton
              icon={<SendWhiteIcon />}
              text={Locale.Chat.Send}
              className={styles["chat-input-send"]}
              noDark
              onClick={onUserSubmit}
            />
            
            <IconButton
              icon={<Upload />}
              text={"Upload"}
              className={styles["chat-input-image"]}
              noDark
              onClick={() => { handleFileClick() }}
            />
            {selectedFile && (
              <div className={styles["chat-input-image-file"]}
                onClick={() => { handleRemoveFile() }}>
                <FileSvg style={{ with: 50, height: 50 }} />

              </div>
            )}

          </div>

        </div> */}
      </div>
    </div>
  );
}

