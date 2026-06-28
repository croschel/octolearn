'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, AlertCircle, Unlink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { disconnectIntegration } from '@/actions/integrations'
import { cn } from '@/lib/utils'

function NotionIcon() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
      <path
        d="M6.017 4.313l55.333-4.087c6.797-.585 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.726 3.883 5.053V95.77c0 4.08-1.553 6.493-6.99 6.883L18.44 106.7c-4.08.195-6.107-.39-8.232-3.116L2.917 94.14C.78 91.218 0 89.058 0 86.34V10.333c0-3.307 1.553-6.107 6.017-6.02z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M61.35.226L6.017 4.313C1.553 4.226 0 7.026 0 10.333v76.006c0 2.72.78 4.88 2.917 7.802l7.29 9.444c2.126 2.726 4.153 3.31 8.232 3.116l70.287-4.047c5.437-.39 6.99-2.804 6.99-6.883V20.64c0-2.19-.78-2.913-3.3-4.666L74.167 3.143C69.893.036 68.147-.358 61.35.226zm6.486 25.984c-5.27.313-10.56.664-15.867.934L37.5 27.925c-4.666.273-5.83-.195-7.8-2.917l-.975-1.358c-1.15-1.593-1.494-2.493-.585-2.493.78 0 .78.195 1.553 1.163l2.916 2.14c1.748 1.358 3.883 1.748 7.99 1.553l32.85-2.14c.39 0 .39.39.195.78l-1.163.78c-.78.585-1.358.39-2.14.39h-.254zM26.26 30.44c.585.78 1.36 1.748 1.943 2.14l22.624 18.253c2.916 2.33 4.08 2.72 11.1 2.33l24.177-1.553c.977 0 1.75-.195 1.75-1.163V30.83c0-.585-.78-1.163-1.944-1.163L28.398 28.5c-.78 0-.78.78-.39 1.358l-1.748.58zM28.203 38.44v43.73c0 2.33.78 3.116 3.5 2.916l47.577-2.72c2.527-.195 3.5-1.553 3.5-3.5V34.96c0-1.748-.585-2.52-2.333-2.52H30.536c-2.14 0-2.334.976-2.334 5.993v.006z"
        fill="black"
      />
    </svg>
  )
}

type Provider = 'notion'

const providerConfig: Record<Provider, { name: string; description: string }> = {
  notion: {
    name: 'Notion',
    description: 'Save quiz reports directly to your Notion workspace.',
  },
}

interface IntegrationCardProps {
  provider: Provider
  workspaceName: string | null
  isConnected: boolean
  connectHref: string
  successMessage?: string
  errorMessage?: string
}

export function IntegrationCard({
  provider,
  workspaceName,
  isConnected,
  connectHref,
  successMessage,
  errorMessage,
}: IntegrationCardProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [localConnected, setLocalConnected] = useState(isConnected)
  const config = providerConfig[provider]

  async function handleDisconnect() {
    setIsDisconnecting(true)
    const result = await disconnectIntegration(provider)
    setIsDisconnecting(false)
    if (!result.error) setLocalConnected(false)
  }

  return (
    <div className="bg-surface border border-border/50 rounded-xl p-5">
      {(successMessage || errorMessage) && (
        <div
          className={cn(
            'flex items-center gap-2 text-[12px] rounded-lg px-3 py-2 mb-4',
            successMessage
              ? 'bg-success/10 border border-success/20 text-success'
              : 'bg-error/10 border border-error/20 text-error',
          )}
        >
          {successMessage ? (
            <CheckCircle className="size-3.5 shrink-0" />
          ) : (
            <AlertCircle className="size-3.5 shrink-0" />
          )}
          {successMessage ?? errorMessage}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border/50 flex items-center justify-center shrink-0">
            <NotionIcon />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[14px] font-semibold text-foreground">{config.name}</p>
              {localConnected ? (
                <span className="text-[10px] font-medium text-success bg-success/10 border border-success/20 rounded-full px-2 py-0.5">
                  Connected
                </span>
              ) : (
                <span className="text-[10px] font-medium text-text-disabled bg-surface-raised border border-border/30 rounded-full px-2 py-0.5">
                  Not connected
                </span>
              )}
            </div>
            <p className="text-[12px] text-text-secondary">
              {localConnected && workspaceName ? workspaceName : config.description}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {localConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              <Unlink className="size-3.5" />
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          ) : (
            <Link href={connectHref}>
              <Button size="sm">Connect {config.name}</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
