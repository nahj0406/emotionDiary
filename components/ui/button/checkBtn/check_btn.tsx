import clsx from "clsx";
import styles from "./check_btn.module.css";
import { forwardRef } from 'react'

type Props = {
  content: string
  disabled?: boolean
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const CheckBtn = forwardRef<HTMLButtonElement, Props>(
  ({ content, disabled, onClick }, ref?) => {
    return (
      <button
        ref={ref}
        // type={submit ? 'submit' : 'button'}
        type='button'
        disabled={disabled}
        onClick={onClick}
        className={clsx(styles.checkBtn, {[styles.disabled]:disabled})}
      >
        {content}
      </button>
    )
  }
)

CheckBtn.displayName = 'SubmitBtn'

export default CheckBtn
