"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import styles from "./pageDetailModal.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import SubmitBtn from "@/components/ui/button/submitBtn/submit_btn";

export default NiceModal.create(
   ({ 
      autoClose = 7000,
      onClick,
      closeBtn = false,
      content,
   }: { 
      autoClose?: number;
      onClick: () => void | Promise<void>;
      closeBtn?: boolean;
      content: React.ReactNode;
   }) => {
      const modal = useModal();

      const handleClose = () => {
         modal.resolve(true);
         modal.hide();
      }

      // useEffect(() => {
      //    if(!closeBtn) {
      //       if (autoClose > 0) {
      //          const timer = setTimeout(() => handleClose(), autoClose);
      //          return () => clearTimeout(timer);
      //       }
      //    }
      // }, [autoClose]);

      return (
         <AnimatePresence
            onExitComplete={() => {
               modal.remove();
            }}
         >
         {modal.visible && (
            <motion.div
               className={styles.frameModal}
               key="modal-overlay"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.2 }}
               // onClick={(e) => e.stopPropagation()}
               // onClick={handleClose}
            >
               <motion.div 
                  className={styles.modal_bg}
                  key='modal-bg'
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={()=> handleClose()}
               >

               </motion.div>
               <motion.div 
                  className={styles.modal_body}
                  key="modal-content"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
               >
                  {content}

                  <SubmitBtn content={'검색'} onClick={
                     async ()=> {
                        await onClick?.(); 
                        handleClose();
                     }}
                  />
               </motion.div>
            </motion.div>
         )}
         </AnimatePresence>
      );
   },
);
