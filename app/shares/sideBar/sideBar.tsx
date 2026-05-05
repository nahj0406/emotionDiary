"use client";

import Login from "@/app/(auth)/login/login";
import styles from "./sideBar.module.css";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { Dispatch, SetStateAction } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserDB } from "@/utils/types/interfaces";
// import { WithId } from "mongodb";

export default function SideBar({
   user,
  openKey,
  keyUpdate,
}: {
   user:UserDB | null
  openKey: boolean;
  keyUpdate: Dispatch<SetStateAction<boolean>>;
}) {

   const bodyRef = useRef<HTMLDivElement>(null);
   const pathname = usePathname();
   const prevPath = useRef(pathname);
   const { data: sesstion } = useSession();

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
         {/* {sesstion ? <Profile user={user}/> : <Login />} */}
         <Login />
      </div>
   );
}
