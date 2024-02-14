import { ScrollArea } from '@mantine/core'

import styles from './style.module.scss'

import { LoadingAnimation } from '~/components/Base/Loading'

type Props = {
  header: Array<React.ReactNode>
  body: Array<React.ReactNode>
  columns: React.CSSProperties['gridTemplateColumns']
  isLoading?: boolean
  bodyScrollAreaHeight?: React.CSSProperties['height']
}

export const GridTable = ({
  header,
  body,
  columns,
  isLoading = false,
  bodyScrollAreaHeight = '100%',
}: Props): React.ReactElement => (
  <div className={styles.table}>
    <div
      className={styles.header}
      style={{
        gridTemplateColumns: columns,
      }}
    >
      {header.map((column, index) => (
        <div key={index} className={styles.columnLabel}>
          {column}
        </div>
      ))}
    </div>
    <ScrollArea type="scroll" h={bodyScrollAreaHeight}>
      {isLoading ? (
        <div className={styles.loading}>
          <LoadingAnimation />
        </div>
      ) : (
        body
      )}
    </ScrollArea>
  </div>
)

type GridRowProps = {
  children: React.ReactNode
  columns: React.CSSProperties['gridTemplateColumns']
  onClick?: () => void
}

export const GridRow = ({
  children,
  columns,
  onClick,
}: GridRowProps): React.ReactElement => {
  return (
    <div
      className={styles.gridRow}
      role="button"
      tabIndex={0}
      onKeyDown={onClick}
      style={{
        gridTemplateColumns: columns,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
