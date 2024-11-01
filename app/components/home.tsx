"use client";

require("../polyfill");

import { useState, useEffect } from "react";

import { IconButton } from "./button";
import styles from "./home.module.scss";

import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/alfa-laval-1.svg";
import Logo from "../icons/logo.png";
import LogoImage from "../icons/chatgpt.svg";  // Renaming the image file import to avoid conflict

import BotIcon from "../icons/bot.svg";
import UserIcon from "../icons/user-svg.svg";
import AddIcon from "../icons/add.svg";
import LoadingIcon from "../icons/three-dots.svg";
import CloseIcon from "../icons/close.svg";

import { useChatStore } from "../store";
import { isMobileScreen } from "../utils";
import Locale from "../locales";
import { Chat } from "./chat";

import dynamic from "next/dynamic";
import { REPO_URL } from "../constant";
import { ErrorBoundary } from "./error";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Flexbox } from "react-layout-kit";
import SearchBar from "./searchBar";
import { ActionIcon,  SideNav } from '@lobehub/ui';
import { Album, CodeXml, Globe, MessageSquare, MonitorCog, Settings2 } from 'lucide-react';
export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"]}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => <Loading noLogo />,
});

function useSwitchTheme() {
  const config = useChatStore((state) => state.config);

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"]:not([media])',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getComputedStyle(document.body)
        .getPropertyValue("--theme-color")
        .trim();
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

function _Home({ data }: { data: any }) {
  const [createNewSession, currentIndex, removeSession] = useChatStore(
    (state) => [
      state.newSession,
      state.currentSessionIndex,
      state.removeSession,
    ],
  );
  const chatStore = useChatStore();
  const loading = !useHasHydrated();
  const [showSideBar, setShowSideBar] = useState(true);

  // setting
  const [openSettings, setOpenSettings] = useState(false);
  const config = useChatStore((state) => state.config);

  useSwitchTheme();

  if (loading) {
    return <Loading />;
  }
  // const { data: session, status, update } = useSession();

  return (
    <div
      className={`${config.tightBorder && !isMobileScreen()
        ? styles["tight-container"]
        : styles.container
        }`}
    >
      <div
        className={styles.sidebar + ` ${showSideBar && styles["sidebar-show"]}`}
      >
        <div className={styles["sidebar-header"]}>
          {data?.user?.image ? (
            <Image
              src={data?.user?.image}
              alt="User Profile"
              objectFit="cover"
              width={50}  // Set width as needed
              height={50} // Set height as needed
              style={{ borderRadius: 100, top: 50 }}
            />
          ) : (
            <UserIcon style={{ width: 50, height: 50 }} />
          )}
          <div className={styles["sidebar-title"]}>
            {" "}
            {data?.user?.name}
          </div>
          <div className={styles["sidebar-sub-title"]}>
            {process.env.NEXT_PUBLIC_SUB_TITLE ??
              data?.user?.email}

          </div>
          <div className={styles["sidebar-logo"]}>

          </div>
        </div>

        <div
          className={styles["sidebar-body"]}
          onClick={() => {
            setOpenSettings(false);
            setShowSideBar(false);
          }}
        >
          {/* <Image
            src={Logo}
            alt="User Profile"
            objectFit="cover"
            width={128}  // Set width as needed
            height={40} // Set height as needed
            style={{ borderRadius: 8, top: 50, background: "#fff", padding: 8, marginBottom: 20 }}
          /> */}
          <SearchBar onSearch={(e)=>{chatStore.onSearch(e)}}/>
          <ChatList />
        </div>

        <div className={styles["sidebar-tail"]}>
          <div className={styles["sidebar-actions"]}>
            <div className={styles["sidebar-action"] + " " + styles.mobile}>
              <IconButton
                icon={<CloseIcon />}
                onClick={chatStore.deleteSession}
              />
            </div>
            <div className={styles["sidebar-action"]}>
              {/* <IconButton
                icon={<SettingsIcon />}
                onClick={() => {
                  setOpenSettings(true);
                  setShowSideBar(false);
                }}
                shadow
              /> */}
            </div>
            <div className={styles["sidebar-action"]}>
              <a href={REPO_URL} target="_blank">
                {/* <IconButton icon={<GithubIcon />} shadow /> */}
              </a>
            </div>
          </div>
          <div>
            <IconButton
              icon={<AddIcon />}
              text={Locale.Home.NewChat}
              onClick={() => {
                createNewSession();
                setShowSideBar(false);
              }}
              shadow
            />
          </div>
        </div>
      </div>

      <div className={styles["window-content"]}>
        {openSettings ? (
          <Settings
            closeSettings={() => {
              setOpenSettings(false);
              setShowSideBar(true);
            }}
          />
        ) : (
          <Chat
            key="chat"
            user={data}
            showSideBar={() => setShowSideBar(true)}
            sideBarShowing={showSideBar}
          />
        )}
      </div>
    </div>
  );
}

export function Home({ data }: { data: any }) {
  const handleOpenPage = (url) => {
    window.open(url, '_blank');
  };
  return (
    <Flexbox
    horizontal
    width={'100%'}
    style={{ height: '100vh', width: '100%' }} // Ensures full viewport height

  >
     <SideNav
      avatar={<LogoImage size={40} />}
      bottomActions={<>
       <ActionIcon icon={Globe}  onClick={() => handleOpenPage('https://www.alfalaval.com/')} />
      <ActionIcon icon={MonitorCog}  onClick={() => handleOpenPage('https://admin.com')} />
      <ActionIcon icon={CodeXml}  onClick={() => handleOpenPage('https://solutions-apps.de/')}  />
      </>}
      topActions={
        <>
          <ActionIcon
          active={true}
          
            icon={MessageSquare}
          
            size="large"
          />
          <ActionIcon
           
            icon={Album}
           
            size="large"
          />
        </>
      }
    />
    
    <ErrorBoundary>
      <_Home data={data}></_Home>
    </ErrorBoundary>
    </Flexbox>
  );
}
