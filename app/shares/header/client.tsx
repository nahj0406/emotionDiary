'use client'

import Link from "next/link";
import styles from './header.module.css'
import { usePathname } from "next/navigation";
import clsx from "clsx";

export const MenuLink = ({href, children}:{href: string, children: React.ReactNode;}) => {
   const pathname = usePathname();
   const isActive = pathname === href;
   return (
      <Link className={clsx({[styles.active]:isActive})} href={href}>{children}</Link>
   )
}