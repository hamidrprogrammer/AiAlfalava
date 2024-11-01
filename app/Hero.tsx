'use client';

import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';


const useStyles = createStyles(({ css, token }) => {
  return {
    desc: css`
      font-size: min(24px, 4vw);
      font-weight: 400;
      color: ${rgba(token.colorText, 0.8)};
      text-align: center;
      text-wrap: balance;
    `,
    title: css`
      margin-block-end: 0;

      font-size: min(56px, 7vw);
      font-weight: 800;
      line-height: 1;
      text-align: center;
      text-wrap: balance;
    `,
  };
});

// eslint-disable-next-line react/display-name
const Hero = memo(() => {
  const { styles } = useStyles();

  

  return (
    <>
      <Flexbox
        align={'center'}
        as={'h1'}
       
        
        justify={'center'}
        wrap={'wrap'}
      >
        <strong style={{ fontSize: 'min(56px, 8vw)' }}>{"BU FOS Mastermin"}</strong>
        <span style={{fontSize:25}}>{'Revolutionizing Customer Support with AI-Powered Conversations'}</span>
      </Flexbox>
      
    </>
  );
});

export default Hero;