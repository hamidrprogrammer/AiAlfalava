import LogoImage from "./icons/chatgpt.svg";  // Renaming the image file import to avoid conflict
import { TfiMicrosoftAlt } from "react-icons/tfi";


import './Card.css'; // Import the CSS file for styling

import Image from 'next/image';  // Keep the Next.js Image component for optimized image rendering

import { signIn, signOut, useSession } from "next-auth/react";

const Login = () => {


    const handleLogin = () => {


        signIn();
    };

    return (
        <div className="card">
            <div className="card-content">
                {/* Use the Next.js Image component for optimized rendering */}
                <LogoImage
                    src={LogoImage} />
                <h2 className="card-title">BU FOS Mastermin</h2>
                <button className="login-button"
                    onClick={handleLogin}>
                    <TfiMicrosoftAlt className="login-icon" />
                    Sign in with Microsoft
                </button>
            </div>
        </div>
    );
};

export default Login;
