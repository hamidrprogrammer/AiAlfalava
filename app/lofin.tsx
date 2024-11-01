import LogoImage from "./icons/chatgptbig.svg";  // Renaming the image file import to avoid conflict
import { TfiMicrosoftAlt } from "react-icons/tfi";


import './Card.css'; // Import the CSS file for styling

import Image from 'next/image';  // Keep the Next.js Image component for optimized image rendering
import { GridShowcase, LogoThree } from '@lobehub/ui';
import { Mails, SendHorizonal, SquareM } from 'lucide-react';
import { Icon } from '@lobehub/ui';

import { signIn, signOut, useSession } from "next-auth/react";
import { Flexbox } from 'react-layout-kit';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import Hero from "./Hero";
import axios from "axios";

const Login = () => {

 
    const handleLogin = () => {


        signIn();
      
    };

    return (
        <GridShowcase style={{ width: '100%' }}>
         <LogoImage
                    src={LogoImage} style={{width:120,height:120}}/>
        
        <Hero />
        <Flexbox gap={16}  justify={'center'} 
        align="center"
        width={'100%'} wrap={'wrap'}>
      <div style={{display: 'flex',gap: 50}}>
      <Button
       
       onClick={() => handleLogin()}
       size={'large'}
       style={{ maxWidth: 220,minHeight:50 ,padding:8,borderRadius:8,backgroundColor:"blue"}}
       type={'primary'}
     >
       <Flexbox align={'center'} gap={4} horizontal justify={'center'}>
        {"LOGIN WITH Microsoft"}
        
         <Icon icon={SquareM} />
       </Flexbox>
     </Button>
      <Button
       
        // onClick={() => router.push('/chat')}
        size={'large'}
        style={{ maxWidth: 220 ,minHeight:50 ,padding:8,borderRadius:8,backgroundColor:"#000"}}
        type={'primary'}
      >
        <Flexbox align={'center'} gap={4} horizontal justify={'center'}>
         {"LOGIN WITH EMAIL"}
         <Icon icon={Mails} />
        </Flexbox>
      </Button>
      </div>
    </Flexbox>
       
        </GridShowcase>
    );
};

export default Login;

