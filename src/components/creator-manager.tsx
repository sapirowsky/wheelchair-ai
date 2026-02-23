import { useState } from 'react'
import { Plus, Trash2, Upload } from 'lucide-react'
import type { Creator } from './wheel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CreatorManagerProps {
  creators: Array<Creator>
  onCreatorsChange: (creators: Array<Creator>) => void
  title?: string
  emptyMessage?: string
  bulkHint?: string
}

export function CreatorManager({
  creators,
  onCreatorsChange,
  title = 'Zarządzaj twórcami',
  emptyMessage = 'Nie dodano jeszcze żadnych twórców',
  bulkHint = 'Wklej wiele nazw użytkowników, po jednej w linii. Adresy URL YouTube zostaną wygenerowane automatycznie.',
}: CreatorManagerProps) {
  const [username, setUsername] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [bulkUsernames, setBulkUsernames] = useState('')

  const handleAdd = () => {
    if (!username.trim()) return

    const newCreator: Creator = {
      id: Date.now().toString(),
      username: username.trim(),
      youtubeUrl:
        youtubeUrl.trim() ||
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          username.trim(),
        )}`,
    }

    onCreatorsChange([...creators, newCreator])
    setUsername('')
    setYoutubeUrl('')
  }

  const handleBulkAdd = () => {
    if (!bulkUsernames.trim()) return

    const lines = bulkUsernames
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (lines.length === 0) return

    const newCreators: Array<Creator> = lines.map((username) => ({
      id: `${Date.now()}-${Math.random()}`,
      username,
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(username)}`,
    }))

    onCreatorsChange([...creators, ...newCreators])
    setBulkUsernames('')
  }

  const handleDelete = (id: string) => {
    onCreatorsChange(creators.filter((c) => c.id !== id))
  }

  const handleDeleteAll = () => {
    onCreatorsChange([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Dodaj pojedynczo</TabsTrigger>
            <TabsTrigger value="bulk">Import masowy</TabsTrigger>
          </TabsList>
          <TabsContent value="single" className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Nazwa użytkownika"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <Input
                placeholder="URL YouTube (opcjonalne)"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <Button onClick={handleAdd} disabled={!username.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="bulk" className="space-y-2">
            <div className="space-y-2">
              <Textarea
                placeholder="Wpisz nazwy użytkowników, po jednej w linii\nPrzykład:\ntwórca1\ntwórca2\ntwórca3"
                value={bulkUsernames}
                onChange={(e) => setBulkUsernames(e.target.value)}
                rows={6}
              />
              <Button
                onClick={handleBulkAdd}
                disabled={!bulkUsernames.trim()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Dodaj wszystkich
              </Button>
              <p className="text-xs text-muted-foreground">{bulkHint}</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {creators.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {emptyMessage}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  Łącznie twórców: {creators.length}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAll}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Usuń wszystkich
                </Button>
              </div>
              {creators.map((creator) => (
                <div
                  key={creator.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{creator.username}</p>
                    <a
                      href={creator.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      {creator.youtubeUrl}
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(creator.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
