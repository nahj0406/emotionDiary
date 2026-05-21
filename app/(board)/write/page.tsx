
import WriteFrame from './client';
import styles from './page.module.css'
import clsx from "clsx";

export default async function Write() {

   return (
      <section className={clsx(styles.layer_box, 'containerV1')}>
         <WriteFrame />
      </section>
   )
}