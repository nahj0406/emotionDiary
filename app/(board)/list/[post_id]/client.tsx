'use client'
import styles from './page.module.css'
import DOMPurify from 'isomorphic-dompurify'; 
// html 렌더링 할때 필요. 원래는 dompurify만 써도 되는데 이게 브라우저 전용이라
// next.js는 서버환경도 같이 하다 보니 에러가 나서 둘 다 적용 가능한 isomorphic-dompurify 이걸로 바꿈
// dangerouslySetInnerHTML 리액트에 탑재된 html 렌더링용 코드

export function ContentBox ({contentDB}:{contentDB: {content : string}}) {
   return (
      <div className={styles.content}>
         <div
            dangerouslySetInnerHTML={{
               __html: DOMPurify.sanitize(contentDB.content),
            }}
         />
      </div>
   )
}