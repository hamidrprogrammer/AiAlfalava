'use client';  // Add this to force this component to be a Client Component

import { Analytics } from "@vercel/analytics/react";

import { Home } from "./components/home";
import Demo from "./lofin";
import { SessionProvider, useSession } from "next-auth/react";
import { getSession } from "next-auth/react";
import { ThemeProvider, GradientButton } from '@lobehub/ui'
import axios from "axios";

const ProtectedPage = () => {
  return (
    <div>
      <h1>This is a protected page</h1>
      <p>You can only see this if you are logged in!</p>
    </div>
  );
};

// Server-side rendering for session check


export default function App() {
  const { data: session, status, update } = useSession();
  console.log("session");
  console.log(session);
  console.log("session");
  const handleSubmit = async () => {
   

    const userData = {
      image :session?.user?.image,
      name:session?.user?.name,
      username:session?.user?.email,
    };

    try {
      const response = await axios.post("https://bu-fos-mastermind.solutions-apps.com/ai/users", userData);
     
      console.log("User creation response:", response.data);
    
    } catch (error) {
      console.error("Error creating user:", error);
     
    }
  };
  if(session!=null){
    handleSubmit()
  }
  return (
    <>
    <ThemeProvider>
      {session == null ? <Demo /> :


        <>
          <Home data={session} />
          <Analytics />
        </>}
        </ThemeProvider>
    </>
  );
}
