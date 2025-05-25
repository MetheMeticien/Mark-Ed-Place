// app/components/ChatBot.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, X, Send, Search, DollarSign, HelpCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export type ChatMode = 'search' | 'price' | 'ask'

interface Source {
  title: string
  description: string
  price: number
  category: string
  condition: string
}

interface Message {
  type: 'user' | 'bot'
  content: string
  sources?: Source[]
}

const API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:9000'

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<ChatMode>('ask')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(scrollToBottom, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userMessage = input.trim()
    if (!userMessage) return

    // add user message
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }])
    setInput('')
    setIsLoading(true)

    try {
      let endpoint = '/ask'
      let body: Record<string, any> = { question: userMessage }

      if (mode === 'search') {
        endpoint = '/search'
        // match backend schema key
        body = { query: userMessage, k: 3 }
      } else if (mode === 'price') {
        endpoint = '/price-estimate'
        // split and trim input
        const [title, description, condition] = userMessage
          .split('|')
          .map((s) => s.trim())
        // match backend schema key names
        body = { item_title: title, item_description: description, condition: condition }
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()

      if (mode === 'search') {
        const sources = data.results?.map((doc: any) => ({
          title: doc.metadata.title,
          description: doc.metadata.description,
          price: doc.metadata.price,
          category: doc.metadata.category,
          condition: doc.metadata.condition,
        }))
        setMessages((prev) => [
          ...prev,
          { type: 'bot', content: 'Here are the products I found:', sources },
        ])
      } else if (mode === 'price') {
        setMessages((prev) => [
          ...prev,
          { type: 'bot', content: `Estimated price: $${data.estimate}` },
        ])
      } else {
        const sources = data.sources?.map((doc: any) => ({
          title: doc.metadata.title,
          description: doc.metadata.description,
          price: doc.metadata.price,
          category: doc.metadata.category,
          condition: doc.metadata.condition,
        }))
        setMessages((prev) => [
          ...prev,
          { type: 'bot', content: data.answer, sources },
        ])
      }
    } catch (err) {
      console.error('Chat error:', err)
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive',
      })
      setMessages((prev) => [
        ...prev,
        { type: 'bot', content: 'Sorry, something went wrong.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const getModeDescription = () => {
    switch (mode) {
      case 'search':
        return 'Search for products'
      case 'price':
        return 'Get price estimates (format: title | description | condition)'
      case 'ask':
      default:
        return 'Ask questions about products'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-[600px] h-[700px] flex flex-col shadow-xl">
          {/* header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Chat Assistant</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {/* mode selector */}
          <div className="p-4 border-b flex gap-2">
            <Button
              variant={mode === 'search' ? 'default' : 'outline'}
              onClick={() => setMode('search')}
              className="flex-1"
            >
              <Search className="h-4 w-4 mr-2" />Search
            </Button>
            <Button
              variant={mode === 'price' ? 'default' : 'outline'}
              onClick={() => setMode('price')}
              className="flex-1"
            >
              <DollarSign className="h-4 w-4 mr-2" />Price
            </Button>
            <Button
              variant={mode === 'ask' ? 'default' : 'outline'}
              onClick={() => setMode('ask')}
              className="flex-1"
            >
              <HelpCircle className="h-4 w-4 mr-2" />Ask
            </Button>
          </div>
          <div className="px-4 py-2 text-sm text-muted-foreground">
            {getModeDescription()}
          </div>

          {/* messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    {msg.content}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <div className="text-sm font-semibold">Related Products:</div>
                        {msg.sources.map((src, idx) => (
                          <div key={idx} className="text-sm border-t pt-2">
                            <div className="font-medium">{src.title}</div>
                            <div className="text-xs text-muted-foreground">{src.description}</div>
                            <div className="text-xs">
                              ${src.price} • {src.category} • {src.condition}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex space-x-2">
                      {[...Array(3)].map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-${idx * 100}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* input */}
          <form onSubmit={handleSubmit} className="p-4 border-t flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'price'
                  ? 'Title | Description | Condition'
                  : 'Type your message...'
              }
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
