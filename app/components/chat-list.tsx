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
import { Edit } from "lucide-react";
import React, { useState } from "react";

export function ChatItem(props: {
  onClick?: () => void;
  onDelete?: () => void;
  title: string;
  count: number;
  time: string;
  selected: boolean;
  isEditing:boolean;
  id: number;
  index: number;
  onEdite?: () => void;
  onSave?: (text:string) => void;
}) {
  const [editTitle, setEditTitle] = React.useState(props.title);
  const handleSaveEdit = () => {
    if (props.onSave) {
      props.onSave(editTitle);
    }
  };
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
          {props.isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit} // Save on blur
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSaveEdit(); // Save on Enter
              }}
            />
          ) : (
            <div className={styles["chat-item-title"]}>{props.title}</div>
          )}
          <div className={styles["chat-item-info"]}>
            <div className={styles["chat-item-count"]}>
              {Locale.ChatItem.ChatItemCount(props.count)}
            </div>
            <div className={styles["chat-item-date"]}>{props.time}</div>
          </div>
          <div className={styles["chat-item-delete"]} onClick={props.onDelete}>
            <DeleteIcon />
          </div>
          <div className={styles["chat-item-delete"]} style={{right:30}} onClick={() => props.onEdite()}>
            <Edit size={15} onClick={()=>{}}/>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export function ChatList() {
  const [sessions, filter,searchKey,selectedIndex, selectSession,, removeSession, moveSession,] =
    useChatStore((state) => [
      state.sessions,
      state.filter,
      state.searchKey,
      state.currentSessionIndex,
      state.selectSession,
      state.removeSession,
      state.moveSession,
      state.onSearch,
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
  const handleEdit = (id, newTitle) => {
    console.log(newTitle);
    
    chatStore.editedSession(newTitle)
    setEditingId(null); // Exit edit mode after saving
  };
  const [editingId, setEditingId] = useState(null);
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chat-list">
        {(provided) => (
          <div
            className={styles["chat-list"]}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {searchKey>0?filter.map((item, i) => (
              <ChatItem
                title={item.topic}
                time={item.lastUpdate}
                count={item.messages.length}
                key={item.id}
                id={item.id}
                index={i}
                onSave={(newTitle) => handleEdit(item.id, newTitle)}
                selected={i === selectedIndex}
                onClick={() => selectSession(i)}
                isEditing={editingId === item.id}
                onDelete={chatStore.deleteSession}
                onEdite={() => setEditingId(item.id)}
              />
            )):
            sessions.map((item, i) => (
              <ChatItem
                title={item.topic}
                time={item.lastUpdate}
                count={item.messages.length}
                key={item.id}
                id={item.id}
                index={i}
                onSave={(newTitle) => handleEdit(item.id, newTitle)}
                selected={i === selectedIndex}
                onClick={() => selectSession(i)}
                isEditing={editingId === item.id}
                onDelete={chatStore.deleteSession}
                onEdite={() => setEditingId(item.id)}
              />
            ))}
           
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
