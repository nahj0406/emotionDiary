
export default function SvgIcon ({
   name,
   width,
}:{
   name: string;
   width?: string;
}) {
   return (
      <>
         {name === 'menu_home' &&
            <svg xmlns="http://www.w3.org/2000/svg" width={width ?? "28"} height="auto" viewBox="0 0 28 29" fill="none">
               <path d="M18.0524 28.0005V16.6322C18.0524 16.2553 17.9027 15.8938 17.6362 15.6273C17.3697 15.3608 17.0082 15.2111 16.6313 15.2111H10.9472C10.5703 15.2111 10.2088 15.3608 9.94234 15.6273C9.67584 15.8938 9.52612 16.2553 9.52612 16.6322V28.0005" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M1 12.369C0.999901 11.9556 1.09 11.5471 1.26401 11.1721C1.43802 10.7971 1.69176 10.4645 2.00752 10.1977L11.9548 1.67141C12.4678 1.23787 13.1177 1 13.7894 1C14.461 1 15.111 1.23787 15.6239 1.67141L25.5712 10.1977C25.887 10.4645 26.1407 10.7971 26.3147 11.1721C26.4888 11.5471 26.5789 11.9556 26.5788 12.369V25.1584C26.5788 25.9122 26.2793 26.6351 25.7463 27.168C25.2133 27.701 24.4904 28.0005 23.7367 28.0005H3.84208C3.08832 28.0005 2.36542 27.701 1.83243 27.168C1.29943 26.6351 1 25.9122 1 25.1584V12.369Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         }

         {name === 'menu_write' &&
            <svg xmlns="http://www.w3.org/2000/svg" width={width ?? "28"} height="auto" viewBox="0 0 28 34" fill="none">
               <path d="M13.7998 9V18.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M1 29V5C1 3.93913 1.42143 2.92172 2.17157 2.17157C2.92172 1.42143 3.93913 1 5 1H25C25.4243 1 25.8313 1.16857 26.1314 1.46863C26.4314 1.76869 26.6 2.17565 26.6 2.6V31.4C26.6 31.8243 26.4314 32.2313 26.1314 32.5314C25.8313 32.8314 25.4243 33 25 33H5C3.93913 33 2.92172 32.5786 2.17157 31.8284C1.42143 31.0783 1 30.0609 1 29ZM1 29C1 27.9391 1.42143 26.9217 2.17157 26.1716C2.92172 25.4214 3.93913 25 5 25H26.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M9 13.8H18.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         }

         {name === 'menu_bookMark' &&
            <svg xmlns="http://www.w3.org/2000/svg" width={width ?? "27"} height="auto" viewBox="0 0 27 34" fill="none">
               <path d="M10.375 1V13.5L15.0625 8.8125L19.75 13.5V1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M1 28.3438V4.90625C1 3.87025 1.41155 2.87668 2.14411 2.14411C2.87668 1.41155 3.87025 1 4.90625 1H24.4375C24.8519 1 25.2493 1.16462 25.5424 1.45765C25.8354 1.75067 26 2.1481 26 2.5625V30.6875C26 31.1019 25.8354 31.4993 25.5424 31.7924C25.2493 32.0854 24.8519 32.25 24.4375 32.25H4.90625C3.87025 32.25 2.87668 31.8384 2.14411 31.1059C1.41155 30.3733 1 29.3798 1 28.3438ZM1 28.3438C1 27.3077 1.41155 26.3142 2.14411 25.5816C2.87668 24.8491 3.87025 24.4375 4.90625 24.4375H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         }

         {name === 'menu_recommend' &&
            <svg xmlns="http://www.w3.org/2000/svg" width={width ?? "27"} height="34" viewBox="0 0 27 34" fill="none">
               <path d="M1 28.3438V4.90625C1 3.87025 1.41155 2.87668 2.14411 2.14411C2.87668 1.41155 3.87025 1 4.90625 1H24.4375C24.8519 1 25.2493 1.16462 25.5424 1.45765C25.8354 1.75067 26 2.1481 26 2.5625V30.6875C26 31.1019 25.8354 31.4993 25.5424 31.7924C25.2493 32.0854 24.8519 32.25 24.4375 32.25H4.90625C3.87025 32.25 2.87668 31.8384 2.14411 31.1059C1.41155 30.3733 1 29.3798 1 28.3438ZM1 28.3438C1 27.3077 1.41155 26.3142 2.14411 25.5816C2.87668 24.8491 3.87025 24.4375 4.90625 24.4375H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M8.21889 13.1875C7.89017 12.8448 7.63429 12.439 7.4667 11.9947C7.2991 11.5503 7.22326 11.0767 7.24375 10.6022C7.26425 10.1278 7.38065 9.66242 7.58593 9.23419C7.79121 8.80597 8.08113 8.42378 8.43817 8.11068C8.79522 7.79758 9.21199 7.56006 9.66335 7.41245C10.1147 7.26485 10.5913 7.21021 11.0644 7.25185C11.5374 7.29349 11.9971 7.43054 12.4158 7.65472C12.8344 7.8789 13.2033 8.18558 13.5001 8.55624C13.7984 8.18945 14.1676 7.88659 14.5857 7.66578C15.0037 7.44497 15.462 7.31074 15.9331 7.27113C16.4042 7.23151 16.8785 7.28732 17.3275 7.43523C17.7765 7.58313 18.1911 7.82008 18.5465 8.13191C18.9018 8.44373 19.1906 8.82403 19.3956 9.25005C19.6006 9.67607 19.7176 10.1391 19.7395 10.6113C19.7614 11.0836 19.6879 11.5554 19.5233 11.9986C19.3586 12.4418 19.1063 12.8472 18.7814 13.1906L14.6783 17.6531C14.5319 17.8217 14.351 17.9568 14.1479 18.0494C13.9448 18.1421 13.7242 18.19 13.5009 18.19C13.2777 18.19 13.057 18.1421 12.8539 18.0494C12.6508 17.9568 12.47 17.8217 12.3236 17.6531L8.21889 13.1875Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         }

         {name === 'menu_recently' &&
            <svg xmlns="http://www.w3.org/2000/svg" width={width ?? "27"} height="30" viewBox="0 0 27 30" fill="none">
               <path d="M17.6667 17.6667V20.7222L19.889 22.1111" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M17.6667 3.77777H20.4445C21.1812 3.77777 21.8878 4.07043 22.4087 4.59136C22.9296 5.1123 23.2223 5.81884 23.2223 6.55555V7.7111" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M6.55556 3.77777H3.77778C3.04107 3.77777 2.33453 4.07043 1.81359 4.59136C1.29266 5.1123 1 5.81884 1 6.55555V26C1 26.7367 1.29266 27.4432 1.81359 27.9642C2.33453 28.4851 3.04107 28.7778 3.77778 28.7778H6.55556" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M17.6666 28.7778C22.269 28.7778 25.9999 25.0468 25.9999 20.4444C25.9999 15.8421 22.269 12.1111 17.6666 12.1111C13.0642 12.1111 9.33325 15.8421 9.33325 20.4444C9.33325 25.0468 13.0642 28.7778 17.6666 28.7778Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M16.2779 1H7.94455C7.17749 1 6.55566 1.62183 6.55566 2.38889V5.16667C6.55566 5.93373 7.17749 6.55556 7.94455 6.55556H16.2779C17.0449 6.55556 17.6668 5.93373 17.6668 5.16667V2.38889C17.6668 1.62183 17.0449 1 16.2779 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         }

         {name === 'close' && 
            <svg xmlns="http://www.w3.org/2000/svg" width={width ?? '18'} height="auto" viewBox="0 0 18 18" fill="none">
               <path d="M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M1 1L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
         }

         {name === 'arrow_bottom' && 
            <svg xmlns="http://www.w3.org/2000/svg" width={width ?? '18'} height="auto" viewBox="0 0 18 10" fill="none">
               <path d="M1 1C1 1 8.2 9 9 9C9.8 9 17 1 17 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
         }
      </>
   )
}