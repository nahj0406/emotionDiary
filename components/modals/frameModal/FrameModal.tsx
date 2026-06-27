"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import styles from "./FrameModal.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export default NiceModal.create(
   ({ 
      autoClose = 7000,
      onClick,
      closeBtn = false,
      children,
   }: { 
      autoClose?: number;
      onClick?: () => void;
      closeBtn?: boolean;
      children: React.ReactNode;
   }) => {
      const modal = useModal();

      const handleClose = () => {
         modal.resolve(true);
         modal.hide();
      }

      useEffect(() => {
         if(!closeBtn) {
            if (autoClose > 0) {
               const timer = setTimeout(() => handleClose(), autoClose);
               return () => clearTimeout(timer);
            }
         }
      }, [autoClose]);

      return (
         <AnimatePresence
         onExitComplete={() => {
            modal.remove();
         }}
         >
         {modal.visible && (
            <motion.div
               className={styles.confirmModal}
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
                  {children}
               </motion.div>
            </motion.div>
         )}
         </AnimatePresence>
      );
   },
);
