import { nickCheck, PostDTO } from "@/types/interfaces";
import { SignupRequest } from "@/types/interfaces";
import { PostCardDTO } from "@/types/interfaces";

export async function createMailcode (email: string) {
   const res = await fetch("/api/auth/get_verificationMail", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
   });

   const result = await res.json(); // 디버깅용

   if (!res.ok) {
      console.log("서버 응답:", result);
      throw new Error(result.message || "에러");
   }

   return result.verificationId;
}


export async function getVerifiedCode ({email, code}:{email: string, code: string}) {
   const res = await fetch("/api/auth/verify-mailCheck", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
   });

   const result = await res.json(); // 🔥 추가

   if (!res.ok) {
      console.log("❌ 서버 응답:", result); // 🔥 핵심
      throw new Error(result.message || "에러");
   }

   return result.ok;
}


export async function createSubmit (data: SignupRequest) {
   const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
   });

   const result = await res.json(); // 🔥 추가

   if (!res.ok) {
      console.log("❌ 서버 응답:", result); // 🔥 핵심
      throw new Error(result.message || "에러");
   }
}


export async function resetPw_mailCode (email: string) {
   const res = await fetch("/api/auth/get_resetPw_verification", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
   });

   const result = await res.json(); // 디버깅용

   if (!res.ok) {
      console.log("서버 응답:", result);
      throw new Error(result.message || "에러");
   }

   return result.verificationId;
}

type updatePw = {
   email: string;
   password: string;
}

export async function updatePassword (data: updatePw) {
   const res = await fetch('/api/auth/user/findPwReset', {
      method: 'PUT',
      headers: {
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({data}),
   })

   const result = await res.json();

   if(!res.ok) {
      console.log('서버 응답:', result.message);
      throw new Error(result.message || '에러');
   }

   return result
}

// 글 작성
export async function createPostSubmit (result: FormData) {
   const res = await fetch('/api/post/write', {
      method: 'POST',
      body: result,
   })

   return res;
}

// 글 수정
export async function  updatePostSubmit (result: FormData) {
   const res = await fetch('/api/post/update', {
      method: 'PUT',
      body: result,
   })

   return res;
}

// 글 삭제
export async function deletePostOne (postId: string) {
   const res = await fetch(
      `/api/post/delete?postId=${postId}`,
      {
         method: 'DELETE',
      }
   )

   const data = await res.json();

   if (!res.ok) {
      throw new Error(data.message)
   }

   return data
}


// 닉네임 체크
export async function getCheckNickName (result: string) : Promise<nickCheck> {
   const res = await fetch(
      "/api/auth/user/nickname_duplication?nickname=" + result
   ).then((r) => r.json());

   return res
}

// 업데이트 프로필
export async function updateProfile (formData: FormData) {
   const res = await fetch('/api/auth/user/updateProfile', {
      method: 'PUT',
      body: formData,
   })

   const data = await res.json();

   if(!res.ok) {
      console.log('서버 응답:', data.message);
      throw new Error(data.message || '에러');
   }

   return data
}


export async function publicIdImageDelete (arr: string[]) {
   const res = await fetch('/api/post/editor/delete', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         publicIds: arr,
      }),
   })

   const data = await res.json();

   if(!res.ok) {
      console.log('서버 응답:', data.message);
      throw new Error(data.message || '에러');
   }

   return data
}