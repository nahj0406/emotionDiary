'use client'

import { TagDTO } from "@/types/interfaces";
import styles from './tagCheckBoxGropu.module.css';
import clsx from "clsx";

type Props = {
  list: TagDTO[];
  tagKeys: string[];
  setTagKeys: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function TagCheckBoxGroup ({ list, tagKeys, setTagKeys }:Props) {
   return (
      <div className={styles.tag_list}>
         {
            list.map((tag: TagDTO, i: number) => {
               return (
                  <label className={styles.tagItem} htmlFor={tag.slug} key={`${tag.slug}_${i}`}>
                     <input 
                        id={tag.slug}
                        type="checkBox" 
                        value={tag._id.toString()}
                        onChange={(e) => {

                           const value = e.target.value;
                           
                           setTagKeys(prev => {
                              if(e.target.checked) {
                                 return prev.includes(value)
                                 ? prev
                                 : [...prev, value]
                              }

                              return prev.filter(v => v !== value);
                           }
                           );
                        }}
                        disabled={
                           tagKeys.length >= 3 &&
                           !tagKeys.includes(tag._id.toString())
                        }
                        // readOnly 리액트에선 input에 그냥 value 속성 달면 입력 필드로 알아서 체크박스 에러 날 수 있음. 
                        // 그래서 디폴트벨류 쓰거나 readOnly 해줘야 함.
                     />

                     <div 
                        className={clsx(
                           styles[`${tag.slug}`], 
                           styles.emotion
                        )}
                     ></div>
                     <span>{tag.name}</span>
                  </label>
               )
            })
         }
      </div>
   )
}