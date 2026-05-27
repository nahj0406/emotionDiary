'use client'

import ConfirmModal from '@/components/modals/ConfirmModal';
import NiceModal from '@ebay/nice-modal-react';
import { Session } from 'next-auth';
import { usePathname, useRouter } from 'next/navigation';

export function useSessionChecker (session: Session | null ) {
   const pathname = usePathname();
   const router = useRouter();
   const checkSession = () => {
      if(!session) {
         NiceModal.show(ConfirmModal, {
            message: '로그인이 필요합니다.',
            autoClose: 1000,
         });

         setTimeout(() => {
            router.push(`/?auth=required&callbackUrl=${pathname}`);
         }, 1000);

         return false;
      }

      return true;
   }

   return { checkSession }
}