"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import styles from "./AuthModal.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import SvgIcon from "@/components/ui/svg/icon/svgIcon";
import { AuthModalPage } from "@/types/interfaces";

type ContentProps = {
  close: () => void;
  page: AuthModalPage;
  setPage: React.Dispatch<React.SetStateAction<AuthModalPage>>;
};

export default NiceModal.create(
   ({ 
      onClick,
      // closeBtn = false,
      content,
   }: { 
      autoClose?: number;
      onClick?: () => void;
      // closeBtn?: boolean;
      content: (props: ContentProps) => React.ReactNode;
   }) => {
      const [page, setPage] = useState<'login' | 'findPw' | 'signIn'>('login');

      const modal = useModal();

      const handleClose = () => {
         modal.resolve(true);
         modal.hide();
      }

      // useEffect(() => {
      //    // if(!closeBtn) {
      //       if (autoClose > 0) {
      //          const timer = setTimeout(() => handleClose(), autoClose);
      //          return () => clearTimeout(timer);
      //       }
      //    // }
      // }, [autoClose]);

      return (
         <AnimatePresence
         onExitComplete={() => {
            modal.remove();
         }}
         >
         {modal.visible && (
            <motion.div
               className={styles.Modal}
               key="modal-overlay"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.2 }}
               // onClick={(e) => e.stopPropagation()}
               // onClick={handleClose}
            >
               <motion.div 
                  className={styles.modal_body}
                  key="modal-content"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
               >
                  <button
                     className={styles.close_btn}
                     onClick={() => handleClose()}
                  >
                     <SvgIcon name={'close'} width="16" />
                  </button>
                  {content({
                     close: () => handleClose(),
                     page,
                     setPage,
                  })}
               </motion.div>
            </motion.div>
         )}
         </AnimatePresence>
      );
   },
);
