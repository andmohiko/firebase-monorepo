import Link from 'next/link'

import styles from './style.module.css'

type Props = {
  href: string
  label: string
  target?: '_self' | '_blank'
  size?: FontSizing
}

type FontSizing = 'sm' | 'md' | 'lg'

const getFontSize = (size: FontSizing): number => {
  if (size === 'sm') {
    return 13
  }
  if (size === 'lg') {
    return 18
  }
  return 15
}

const urlPattern = /https?:\/\/[-_.!~*'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/

export const isExternalLink = (href: string): boolean => {
  return urlPattern.test(href)
}

export const LinkItem = ({
  href,
  label,
  target = '_self',
  size = 'md',
}: Props): React.ReactElement => {
  return isExternalLink(href) ? (
    <a
      href={href}
      target={target}
      className={styles.linkItem}
      style={{
        fontSize: getFontSize(size),
      }}
    >
      {label}
    </a>
  ) : (
    <Link
      href={href}
      target={target}
      className={styles.linkItem}
      style={{
        fontSize: getFontSize(size),
      }}
    >
      {label}
    </Link>
  )
}
