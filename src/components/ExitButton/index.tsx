import Link from 'next/link'
import React from 'react'

import styles from './ExitButton.module.scss'

export default function Button({ router }) {
  const previewExitUrl = '/api/exit-preview'
  return (
    <>
      {router && (
        <div className={styles.preview}>
          <Link href={previewExitUrl}>
            <a className={styles.menu}>Sair do modo Preview</a>
          </Link>

        </div>
      )}
    </>
  )

}