"use client";

import Image from "next/image";
import styles from "./checkInput.module.css";
import { useState } from "react";
import clsx from "clsx";

export function CheckInput({
  custom,
  name,
  icon,
  checked,
  onChange,
}: {
  custom: boolean;
  name?: string;
  icon?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {

  return (
   <div className={styles.input_wrapper}>
      <input
         type="checkbox"
         name={name}
         checked={checked}
         onChange={onChange}
         hidden={custom}
      />
      {custom && (
         <div className={clsx(styles.check_bg, { [styles.active]: checked })}>
            {icon ? (
            <Image src={icon} alt={"체크박스 아이콘 필요"} />
            ) : (
            <p>※ 아이콘 url 필요</p>
            )}
         </div>
      )}
   </div>
  );
}
