"use client";

import Image from "next/image";
import styles from "./checkInput.module.css";
import { useState } from "react";
import clsx from "clsx";

export function CheckInput({
  custom,
  name,
  id,
  icon,
}: {
  custom: boolean;
  name: string;
  id: string;
  icon?: string;
}) {
  const [active, setActive] = useState(false);

  return (
   <div className={styles.input_wrapper}>
      <input
         type="checkbox"
         name={name}
         id={id}
         onChange={(e) => setActive(e.target.checked)}
         hidden={custom}
      />
      {custom && (
         <div className={clsx(styles.check_bg, { [styles.active]: active })}>
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
