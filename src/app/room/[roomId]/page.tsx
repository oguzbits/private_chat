'use client'

import { useRef } from 'react'
import { useParams } from 'next/navigation'
import { useState } from 'react'

const formatTimeRemaining = (timeRemainingInSec: number) => {
  const minutes = Math.floor(timeRemainingInSec / 60)
  const seconds = timeRemainingInSec % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const Page = () => {
  const { roomId } = useParams()

  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const [copyStatus, setCopyStatus] = useState('COPY')
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  const copyToClipboard = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopyStatus('COPIED!')
    setTimeout(() => {
      setCopyStatus('COPY')
    }, 2000)
  }

  return (
    <main className="flex h-screen max-h-screen flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/30 p-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">Room ID</span>
            <div className="flex items-center gap-2">
              <span className="truncate font-bold text-green-500">
                {roomId?.slice(0, 10) + '...'}
              </span>
              <button
                onClick={copyToClipboard}
                className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
              >
                {copyStatus}
              </button>
            </div>
          </div>

          <div className="h-8 w-px bg-zinc-800" />

          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">
              Self-Destruct
            </span>
            <span
              className={`flex items-center gap-2 text-sm font-bold ${
                timeRemaining !== null && timeRemaining < 60
                  ? 'text-red-500'
                  : 'text-amber-500'
              }`}
            >
              {timeRemaining !== null
                ? formatTimeRemaining(timeRemaining)
                : '--:--'}
            </span>
          </div>
        </div>
        <button className="group flex items-center gap-2 rounded bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-400 transition-all hover:bg-red-600 hover:text-white disabled:opacity-50">
          <span className="group-hover:animate-pulse">💣</span>
          DESTROY NOW
        </button>
      </header>

      {/* MESSAGES */}
      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4"></div>

      {/* MESSAGE INPUT */}
      <div className="border-t border-zinc-800 bg-zinc-900/30 p-4">
        <div className="flex gap-4">
          <div className="group relative flex-1">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 animate-pulse text-green-500">
              {'>'}
            </span>
            <input
              autoFocus
              type="text"
              value={input}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && input.trim()) {
                  // SEND MESSAGE
                }
              }}
              placeholder="Type message..."
              onChange={(e) => setInput(e.target.value)}
              className="w-full border border-zinc-800 bg-black py-3 pr-4 pl-8 text-sm text-zinc-100 transition-colors placeholder:text-zinc-700 focus:border-zinc-700 focus:outline-none"
            />
          </div>

          <button
            onClick={() => {
              // SEND MESSAGE
            }}
            className="cursor-pointer bg-zinc-800 px-6 text-sm font-bold text-zinc-400 transition-all hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            SEND
          </button>
        </div>
      </div>
    </main>
  )
}

export default Page
