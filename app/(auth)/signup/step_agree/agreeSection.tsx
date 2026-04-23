import styles from "./agreeSection.module.css";
import { CheckInput } from "@/components/input/checkbox/checkInput";

export default function AgreeSection() {
  return (
    <div className={styles.container}>
      <article className={styles.document_box}>
        <label htmlFor="agree">
          <CheckInput custom={false} name={"agree"} id={"agree"} />
          <p>이용약관에 동의합니다.</p>
        </label>

        <div className={styles.document}>
          <p>이용약관 내용</p>
        </div>
      </article>

      <article className={styles.document_box}>
        <label htmlFor="privacy">
         <CheckInput custom={true} name={"privacy"} id={"privacy"} />
          <p>개인정보 처리방침에 동의합니다.</p>
        </label>

        <div className={styles.document}>
          <p>개인정보 처리방침 내용</p>
        </div>
      </article>
    </div>
  );
}
