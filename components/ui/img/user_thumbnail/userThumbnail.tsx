
import styles from './userThumbnail.module.css'


export default function UserThumbnail ({
   thumbnail,
   size = 30,
}:{
   thumbnail: string | undefined;
   size?: number;
}) {
   return (
      <figure className={styles.img} style={{width: size, height: size}}>
         {thumbnail ?
            <img src={thumbnail} alt="유저 썸네일" />
            : <img src={'/img/unknown.png'} alt="unknown" />
         }
      </figure>
   )
}