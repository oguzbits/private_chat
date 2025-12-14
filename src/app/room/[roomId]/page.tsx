'use client'

import { useUsername } from '@/hooks/use-username'
import { client } from '@/lib/client'
import { decrypt, encrypt } from '@/lib/encryption'
import { useRealtime } from '@/lib/realtime-client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const DecryptedMessage = ({
  text,
  encryptionKey,
}: {
  text: string
  encryptionKey: string | null
}) => {
  const { data: decrypted } = useQuery({
    queryKey: ['decrypted', text, encryptionKey],
    queryFn: async () => {
      if (!encryptionKey) return null
      return await decrypt(text, encryptionKey)
    },
    staleTime: Infinity,
    retry: false,
  })

  // Case 1: No key provided - should theoretically not happen if we redirect,
  // but good for safety or during transition
  if (!encryptionKey) {
    return (
      <span className="flex items-center gap-1 text-zinc-500 italic">
        Encrypted Content
      </span>
    )
  }

  // Case 2: Key provided but decryption failed
  if (decrypted === null && encryptionKey) {
    return (
      <div className="flex items-start gap-2 rounded bg-red-500/10 p-2 text-xs text-red-500/80">
        <div className="flex flex-col">
          <span className="font-bold">Decryption Failed</span>
          <span className="opacity-80">
            The key provided cannot decrypt this message.
          </span>
        </div>
      </div>
    )
  }

  // Case 3: Success
  return (
    <span className="wrap-break-word whitespace-pre-wrap">
      {decrypted || <span className="animate-pulse">...</span>}
    </span>
  )
}

function formatTimeRemaining(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const Page = () => {
  const params = useParams()
  const roomId = params.roomId as string

  const router = useRouter()

  const { username } = useUsername()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const [copyStatus, setCopyStatus] = useState('COPY')
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null)

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        if (hash.length !== 64) {
          router.push('/?error=invalid-key')
        } else {
          setEncryptionKey(hash)
        }
      } else {
        router.push('/?error=missing-key')
      }
    }

    // Initial check
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [router])

  const { data: ttlData } = useQuery({
    queryKey: ['ttl', roomId],
    queryFn: async () => {
      const res = await client.room.ttl.get({ query: { roomId } })
      return res.data
    },
  })

  useEffect(() => {
    if (ttlData?.ttl !== undefined) setTimeRemaining(ttlData.ttl)
  }, [ttlData])

  useEffect(() => {
    if (timeRemaining === null || timeRemaining < 0) return

    if (timeRemaining === 0) {
      router.push('/?destroyed=true')
      return
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, router])

  const { data: messages, refetch } = useQuery({
    queryKey: ['messages', roomId],
    queryFn: async () => {
      const res = await client.messages.get({ query: { roomId } })
      return res.data
    },
  })

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      const encrypted = encryptionKey
        ? await encrypt(text, encryptionKey)
        : text

      await client.messages.post(
        { sender: username, text: encrypted },
        { query: { roomId } }
      )

      setInput('')
    },
  })

  useRealtime({
    channels: [roomId],
    events: ['chat.message', 'chat.destroy'],
    onData: ({ event }) => {
      if (event === 'chat.message') {
        refetch()
      }

      if (event === 'chat.destroy') {
        router.push('/?destroyed=true')
      }
    },
  })

  const { mutate: destroyRoom } = useMutation({
    mutationFn: async () => {
      await client.room.delete(null, { query: { roomId } })
    },
  })

  const copyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopyStatus('COPIED!')
    setTimeout(() => setCopyStatus('COPY'), 2000)
  }

  return (
    <main className="flex h-screen max-h-screen flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/30 p-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">Room ID</span>
            <div className="flex items-center gap-2">
              <span className="truncate font-bold text-green-500">
                {roomId.slice(0, 10) + '...'}
              </span>
              <button
                onClick={copyLink}
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

        <button
          onClick={() => destroyRoom()}
          className="group flex items-center gap-2 rounded bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-400 transition-all hover:bg-red-600 hover:text-white disabled:opacity-50"
        >
          <span className="group-hover:animate-pulse">💣</span>
          DESTROY NOW
        </button>
      </header>

      {/* MESSAGES */}
      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
        {messages?.messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-sm text-zinc-600">
              No messages yet, start the conversation.
            </p>
          </div>
        )}

        {messages?.messages.map((msg) => (
          <div key={msg.id} className="flex flex-col items-start">
            <div className="group max-w-[80%]">
              <div className="mb-1 flex items-baseline gap-3">
                <span
                  className={`text-xs font-bold ${
                    msg.sender === username ? 'text-green-500' : 'text-blue-500'
                  }`}
                >
                  {msg.sender === username ? 'YOU' : msg.sender}
                </span>

                <span className="text-[10px] text-zinc-600">
                  {format(msg.timestamp, 'HH:mm')}
                </span>
              </div>

              <div className="text-sm leading-relaxed break-all text-zinc-300">
                <DecryptedMessage
                  text={msg.text}
                  encryptionKey={encryptionKey}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

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
                  sendMessage({ text: input })
                  inputRef.current?.focus()
                }
              }}
              placeholder={
                encryptionKey ? 'Type message...' : 'Checking encryption...'
              }
              onChange={(e) => setInput(e.target.value)}
              disabled={!encryptionKey}
              className="w-full border border-zinc-800 bg-black py-3 pr-4 pl-8 text-sm text-zinc-100 transition-colors placeholder:text-zinc-700 focus:border-zinc-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <button
            onClick={() => {
              sendMessage({ text: input })
              inputRef.current?.focus()
            }}
            disabled={!input.trim() || isPending || !encryptionKey}
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
