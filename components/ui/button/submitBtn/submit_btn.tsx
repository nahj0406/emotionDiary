import clsx from "clsx";
import styles from "./sumbit_btn.module.css";
import { forwardRef } from 'react'

type Props = {
  content: string
  submit?: boolean
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const SubmitBtn = forwardRef<HTMLButtonElement, Props>(
  ({ content, submit = true, onClick }, ref?) => {
    return (
      <button
        ref={ref}
        // type={submit ? 'submit' : 'button'}
        type='button'
        onClick={onClick}
        className={clsx(styles.button, {[styles.cancel]:!submit})}
      >
        {content}
      </button>
    )
  }
)

SubmitBtn.displayName = 'SubmitBtn'

export default SubmitBtn
