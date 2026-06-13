import { useEffect, useRef, useState } from 'react'

const CHARS = '!<>-_\\/[]{}—=+*^?#@$%&ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function useScramble(finalText, { trigger = true, speed = 40, delay = 0 } = {}) {
  const [output, setOutput] = useState(finalText)
  const frame = useRef(0)
  const iteration = useRef(0)
  const timer = useRef(null)
  const raf = useRef(null)

  useEffect(() => {
    if (!trigger) return

    const run = () => {
      raf.current = requestAnimationFrame(() => {
        setOutput(
          finalText
            .split('')
            .map((char, idx) => {
              if (idx < iteration.current) return char
              if (char === ' ') return ' '
              return CHARS[Math.floor(Math.random() * CHARS.length)]
            })
            .join('')
        )

        if (frame.current % 3 === 0) iteration.current += 1
        frame.current++

        if (iteration.current <= finalText.length) {
          run()
        }
      })
    }

    iteration.current = 0
    frame.current = 0

    timer.current = setTimeout(run, delay)

    return () => {
      clearTimeout(timer.current)
      cancelAnimationFrame(raf.current)
    }
  }, [trigger, finalText, delay])

  return output
}
