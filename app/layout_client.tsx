'use client'
import NiceModal from '@ebay/nice-modal-react';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import { useSession } from "next-auth/react";

export default function ModalProvider ({children} : {children: React.ReactNode;}) {


   return (
      <SessionProvider>
         <NiceModal.Provider>
            {children}
         </NiceModal.Provider>
      </SessionProvider>
   )  
}