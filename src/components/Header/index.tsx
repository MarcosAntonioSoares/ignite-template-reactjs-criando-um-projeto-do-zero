import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={commonStyles.container}>
        <Link href="/">
          <a className={styles.brand}>
            <img src="/images/logo.svg" alt="logo" className={styles.img_logo} />
          </a>
        </Link>
      </div>
    </header>
  )
}
