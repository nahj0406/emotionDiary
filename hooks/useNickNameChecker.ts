
import { nickCheck } from "@/types/interfaces";
import { getCheckNickName } from "@/utils/requester/requester";
import { useState } from "react";

export function useNickNameChecker() {
   const [nickRes, setNickRes] = useState<nickCheck | null>(null);
   const [nickSafeValue, setNickSafeValue] = useState<string>();

   const checkValue = async (nickName: string) => {
      if(!nickName) {
         throw new Error('입력된 닉네임 값이 없습니다.')
      }

      const checkValue = await getCheckNickName(nickName);

      setNickRes(checkValue);

      if (checkValue?.available) {
         setNickSafeValue(nickName);
      }
   }

   return {
      nickRes,
      nickSafeValue,
      checkValue,
   }
}