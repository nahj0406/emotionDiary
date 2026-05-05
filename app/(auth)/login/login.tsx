"use client";

import NiceModal from "@ebay/nice-modal-react";
import styles from "./login.module.css";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "@/components/modals/ConfirmModal";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    console.log(res?.error);

    if (res?.error) {
      return await NiceModal.show(ConfirmModal, {
        message: res?.error,
      });
    }

    router.push("/");
  };

  return (
    <article className={styles.login}>
      <div className={styles.input_box}>
        <span>이메일</span>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일을 입력하세요."
        />
      </div>
      <div className={styles.input_box}>
        <span>비밀번호</span>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요."
        />
      </div>

      <div className={styles.button_box}>
        <button className={styles.submit} type="button" onClick={handleLogin}>
          로그인
        </button>
        <Link href={"/signup"} className={styles.signUp} type="button">
          회원가입
        </Link>
      </div>
    </article>
  );
}
