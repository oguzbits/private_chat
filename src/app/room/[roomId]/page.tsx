'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'

const Page = () => {
  const { roomId } = useParams()

  const [copyState, setCopyState] = useState('COPY')

  const copyToClipboard = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopyState('COPIED')
    setTimeout(() => {
      setCopyState('COPY')
    }, 2000)
  }

  return (
    <main className="flex h-screen max-h-screen flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/30 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-green-500">{roomId}</span>
            <span
              className="cursor-pointer rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
              onClick={copyToClipboard}
            >
              {copyState}
            </span>
          </div>
        </div>
      </header>
    </main>
  )
}

export default Page
