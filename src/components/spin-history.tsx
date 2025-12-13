import { useState } from 'react'
import type { Creator } from './wheel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/translations'

interface SpinHistoryEntry {
  id: string
  timestamp: Date
  wheel1Creator: Creator | null
  wheel2Creator: Creator | null
}

interface SpinHistoryProps {
  history: Array<SpinHistoryEntry>
}

const MAX_DISPLAYED = 15

export function SpinHistory({ history }: SpinHistoryProps) {
  const [showAll, setShowAll] = useState(false)

  const reversedHistory = history.slice().reverse()
  const displayedHistory = showAll
    ? reversedHistory
    : reversedHistory.slice(0, MAX_DISPLAYED)
  const hasMore = history.length > MAX_DISPLAYED

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('spinHistory')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('noSpinsYet')}
              </p>
            ) : (
              displayedHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(entry.timestamp).toLocaleString('pl-PL')}
                  </p>
                  <div className="space-y-1">
                    {entry.wheel1Creator && (
                      <div>
                        <span className="text-xs font-medium">{t('wheel1History')}</span>
                        <a
                          href={entry.wheel1Creator.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          {entry.wheel1Creator.username}
                        </a>
                      </div>
                    )}
                    {entry.wheel2Creator && (
                      <div>
                        <span className="text-xs font-medium">{t('wheel2History')}</span>
                        <a
                          href={entry.wheel2Creator.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          {entry.wheel2Creator.username}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll
                ? t('showLess')
                : `${t('showMore')} (${history.length - MAX_DISPLAYED} ${t('more')})`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
