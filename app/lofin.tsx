import LogoImage from "./icons/logo.png";  // Renaming the image file import to avoid conflict
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
                <Image
                    src={LogoImage}  // This will now use LogoImage as the src
                    alt="Logo"

                    objectFit="cover"
                    className="card-logo"
                />
                <h2 className="card-title">Your App Name</h2>
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
