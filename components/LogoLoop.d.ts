import * as React from 'react'

export interface LogoLoopImageItem {
  src: string
  alt?: string
  title?: string
  href?: string
  srcSet?: string
  sizes?: string
  width?: number
  height?: number
}

export interface LogoLoopNodeItem {
  node: React.ReactNode
  title?: string
  ariaLabel?: string
  href?: string
}

export type LogoLoopItem = LogoLoopImageItem | LogoLoopNodeItem

export interface LogoLoopProps {
  logos: LogoLoopItem[]
  speed?: number
  direction?: 'left' | 'right'
  width?: number | string
  logoHeight?: number
  gap?: number
  pauseOnHover?: boolean
  fadeOut?: boolean
  fadeOutColor?: string
  scaleOnHover?: boolean
  ariaLabel?: string
  className?: string
  style?: React.CSSProperties
}

declare const LogoLoop: React.MemoExoticComponent<(props: LogoLoopProps) => JSX.Element>

export default LogoLoop
