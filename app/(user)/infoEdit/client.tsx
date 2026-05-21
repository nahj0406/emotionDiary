import { UserDB } from "@/utils/types/interfaces";
import { WithId } from "mongodb";
import styles from './page.module.css'
import { signupVal } from "@/utils/validations/signup/infoValidation";

// 수정 시에도 처음 회원가입때 작성 안되게 막은 것들 그대로 구현해주기.

export function EditFrame({user}:{user: WithId<UserDB> | null}) {
   return (
      <div className={styles.wrapper}>
         {
            user?.thumbnail ?
               <img src={user?.thumbnail} alt='유저 썸네일' />
            : <img src={'img/user_unknown.png'} alt='no-img' />
         }

         <article className="itemBox">
            <div className={styles.write_field}>
            <span className={styles.essential}>이름</span>
            {/* <input
              name={signupVal.name.key}
              type="text"
              value={inputs.name.value}
              onChange={(e) => {
                
              }}
              min={signupVal.name.min}
              max={signupVal.name.max}
              onBlur={}
              placeholder={`이름(${signupVal.name.min}글자 이상, ${signupVal.name.max}이하)`}
            />
            {inputs.name.bad_content && <p>사용할 수 없는 이름입니다.</p>}
            {inputs.name.typeNumber && <p>숫자로만 작성된 이름은 사용할 수 없습니다.</p>}
            {
               inputs.name.lengthErr && 
                  <p>{`${signupVal.name.min}글자 이상, ${signupVal.name.max}이하로 작성해 주세요.`}</p>
            } */}
          </div>
         </article>
      </div>
   )
}