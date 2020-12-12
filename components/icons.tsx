import React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

interface Props extends SvgProps {
  size?: number
  color?: string
}
export function QuoteStart(props: Props) {
  return (
    <Svg
      viewBox="0 0 24 24"
      height={props.size || 48}
      width={props.size || 48}
      fill={props.color || "black"}
      {...props}
    >
      <Path d="M3.516 7c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5-3.5-1.567-3.5-3.5l-0.016-0.5c0-3.866 3.134-7 7-7v2c-1.336 0-2.591 0.52-3.536 1.464-0.182 0.182-0.348 0.375-0.497 0.578 0.179-0.028 0.362-0.043 0.548-0.043zM12.516 7c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5-3.5-1.567-3.5-3.5l-0.016-0.5c0-3.866 3.134-7 7-7v2c-1.336 0-2.591 0.52-3.536 1.464-0.182 0.182-0.348 0.375-0.497 0.578 0.179-0.028 0.362-0.043 0.549-0.043z" />
    </Svg>
  )
}
export function QuoteEnd(props: Props) {
  return (
    <Svg
      viewBox="0 0 24 24"
      height={props.size || 48}
      width={props.size || 48}
      fill={props.color || "black"}
      {...props}
    >
      <Path d="M12.5 10c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5l0.016 0.5c0 3.866-3.134 7-7 7v-2c1.336 0 2.591-0.52 3.536-1.464 0.182-0.182 0.348-0.375 0.497-0.578-0.179 0.028-0.362 0.043-0.549 0.043zM3.5 10c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5l0.016 0.5c0 3.866-3.134 7-7 7v-2c1.336 0 2.591-0.52 3.536-1.464 0.182-0.182 0.348-0.375 0.497-0.578-0.179 0.028-0.362 0.043-0.549 0.043z" />
    </Svg>
  )
}
export function Refresh(props: Props) {
  return (
    <Svg
      viewBox="0 0 24 24"
      height={props.size || 48}
      width={props.size || 48}
      fill={props.color || "black"}
      {...props}
    >
      <Path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </Svg>
  )
}
