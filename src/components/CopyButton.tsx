import { useState } from 'react'
import { copyTextToClipboard } from '../lib/clipboard'
import { Button } from './Button'
import { cn } from '../lib/cn'

interface CopyButtonProps {
  text: string
  label?: string
}

export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle')

  async function onCopy() {
    const ok = await copyTextToClipboard(text)
    setState(ok ? 'ok' : 'err')
    window.setTimeout(() => setState('idle'), 1600)
  }

  return (
    <Button
      variant="secondary"
      className={cn('min-h-11 min-w-[8.5rem]', state === 'ok' && 'border-emerald-300')}
      onClick={() => void onCopy()}
    >
      {state === 'ok' ? 'Copied' : state === 'err' ? 'Copy failed' : label}
    </Button>
  )
}
