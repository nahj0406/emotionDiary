"use client";

import Login from "@/app/(auth)/login/login";
import styles from "./sideBar.module.css";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { Dispatch, SetStateAction } from "react";
import { usePathname } from "next/navigation";

export default function SideBar({
  openKey,
  keyUpdate,
}: {
  openKey: boolean;
  keyUpdate: Dispatch<SetStateAction<boolean>>;
}) {

   const bodyRef = useRef<HTMLDivElement>(null);
   const pathname = usePathname();
   const prevPath = useRef(pathname);

   useEffect(() => {
      if (openKey) return;

      const outSideTrigger = (e: MouseEvent) => {
         if (bodyRef.current && !bodyRef.current.contains(e.target as Node)) {
            keyUpdate(false);
         }
      };

      document.addEventListener("mousedown", outSideTrigger);

      return () => {
         document.removeEventListener("mousedown", outSideTrigger);
      };
   }, []);

   useEffect(()=> { // url 바뀌면 닫기
      if(prevPath.current !== pathname) {
         keyUpdate(false);
         prevPath.current = pathname;
      }
   }, [pathname]);

   return (
      <div
         ref={bodyRef}
         className={clsx(styles.sideBar, { [styles.open]: openKey })}
      >
         <Login />
      </div>
   );
}
