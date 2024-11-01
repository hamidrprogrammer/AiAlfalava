import DeleteIcon from "../icons/delete.svg";
import styles from "./home.module.scss";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";

import { useChatStore } from "../store";

import Locale from "../locales";
import { isMobileScreen } from "../utils";

export function ChatItem(props: {
  onClick?: () => void;
  onDelete?: () => void;
  title: string;
  count: number;
  time: string;
  selected: boolean;
  id: number;
  index: number;
}) {
  return (
    <Draggable draggableId={`${props.id}`} index={props.index}>
      {(provided) => (
        <div
          className={`${styles["chat-item"]} ${props.selected && styles["chat-item-selected"]
            }`}
          onClick={props.onClick}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className={styles["chat-item-title"]}>{props.title}</div>
          <div className={styles["chat-item-info"]}>
            <div className={styles["chat-item-count"]}>
              {Locale.ChatItem.ChatItemCount(props.count)}
            </div>
            <div className={styles["chat-item-date"]}>{props.time}</div>
          </div>
          <div className={styles["chat-item-delete"]} onClick={props.onDelete}>
            <DeleteIcon />
          </div>
        </div>
      )}
    </Draggable>
  );
}

export function ChatList() {
  const [sessions, selectedIndex, selectSession, removeSession, moveSession] =
    useChatStore((state) => [
      state.sessions,
      state.currentSessionIndex,
      state.selectSession,
      state.removeSession,
      state.moveSession,
    ]);
  const chatStore = useChatStore();

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source } = result;
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveSession(source.index, destination.index);
  };
  console.log(sessions);
  const generateTitleFromMessages = (messages) => {
    if (messages.length === 0) {
      return "Untitled Chat"; // Fallback if no messages
    }

    // Get the first message content
    const firstMessageContent = messages[0].content;
    const maxLength = 30; // Set the max length for the title

    // Truncate if necessary
    const title = firstMessageContent.length > maxLength
      ? firstMessageContent.substring(0, maxLength) + "..."
      : firstMessageContent;

    // Optionally, append the date for clarity
    return `${title}`; // Combine title and date
  };


  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chat-list">
        {(provided) => (
          <div
            className={styles["chat-list"]}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {sessions.map((item, i) => (
              <ChatItem
                title={item.messages.length > 0 ? item.messages[0].content : item.topic}
                time={item.lastUpdate}
                count={item.messages.length}
                key={item.id}
                id={item.id}
                index={i}
                selected={i === selectedIndex}
                onClick={() => selectSession(i)}
                onDelete={chatStore.deleteSession}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
