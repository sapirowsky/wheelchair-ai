import { CreatorManager } from './creator-manager'
import { ImpedimentManager } from './impediment-manager'
import type { Creator, Impediment } from './wheel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

interface SettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  creators: Array<Creator>
  onCreatorsChange: (creators: Array<Creator>) => void
  impediments: Array<Impediment>
  onImpedimentsChange: (impediments: Array<Impediment>) => void
  wheel1Rigged: Creator | null
  wheel2Rigged: Creator | null
  onWheel1RiggedChange: (creator: Creator | null) => void
  onWheel2RiggedChange: (creator: Creator | null) => void
  maxCreatorsToShow: number
  onMaxCreatorsToShowChange: (max: number) => void
}

export function SettingsSheet({
  open,
  onOpenChange,
  creators,
  onCreatorsChange,
  impediments,
  onImpedimentsChange,
  wheel1Rigged,
  wheel2Rigged,
  onWheel1RiggedChange,
  onWheel2RiggedChange,
  maxCreatorsToShow,
  onMaxCreatorsToShowChange,
}: SettingsSheetProps) {
  // Create items array - use usernames as values for display, but map to IDs
  const wheel1Items = ['Losowo (bez ustawienia)', ...creators.map((c) => c.username)]

  const wheel2Items = ['Losowo (bez ustawienia)', ...creators.map((c) => c.username)]

  const wheel1Value = wheel1Rigged?.username || 'Losowo (bez ustawienia)'
  const wheel2Value = wheel2Rigged?.username || 'Losowo (bez ustawienia)'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Ustawienia</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          <Card>
            <CardHeader>
              <CardTitle>Ustawienia Kół</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-creators">Maksymalna Liczba Twórców na Kole</Label>
                <Input
                  id="max-creators"
                  type="number"
                  min="1"
                  value={maxCreatorsToShow || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10)
                    if (!isNaN(value) && value > 0) {
                      onMaxCreatorsToShowChange(value)
                    } else if (e.target.value === '') {
                      onMaxCreatorsToShowChange(0)
                    }
                  }}
                  placeholder="Wszyscy twórcy"
                />
                <p className="text-xs text-muted-foreground">
                  Podczas kręcenia losowo wybierz tylu twórców z listy. Pozostaw puste lub ustaw 0, aby pokazać wszystkich twórców. Jeśli masz mniej twórców niż ta liczba, wszyscy będą pokazani.
                </p>
              </div>
            </CardContent>
          </Card>

          <CreatorManager
            creators={creators}
            onCreatorsChange={onCreatorsChange}
          />

          <ImpedimentManager
            impediments={impediments}
            onImpedimentsChange={onImpedimentsChange}
          />

          <Card>
            <CardHeader>
              <CardTitle>Ustawienie Wyników</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wheel1-rig">Koło 1 (z góry wybrany wynik)</Label>
                <Combobox
                  items={wheel1Items}
                  value={wheel1Value}
                  onValueChange={(value) => {
                    if (value === 'Losowo (bez ustawienia)' || !value) {
                      onWheel1RiggedChange(null)
                    } else {
                      const creator = creators.find((c) => c.username === value)
                      if (creator) {
                        onWheel1RiggedChange(creator)
                      }
                    }
                  }}
                >
                  <ComboboxInput
                    id="wheel1-rig"
                    placeholder="Wybierz twórcę lub wpisz, aby wyszukać..."
                    className="w-full"
                    showClear
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>Nie znaleziono twórców.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wheel2-rig">Koło 2 (z góry wybrany wynik)</Label>
                <Combobox
                  items={wheel2Items}
                  value={wheel2Value}
                  onValueChange={(value) => {
                    if (value === 'Losowo (bez ustawienia)' || !value) {
                      onWheel2RiggedChange(null)
                    } else {
                      const creator = creators.find((c) => c.username === value)
                      if (creator) {
                        onWheel2RiggedChange(creator)
                      }
                    }
                  }}
                >
                  <ComboboxInput
                    id="wheel2-rig"
                    placeholder="Wybierz twórcę lub wpisz, aby wyszukać..."
                    className="w-full"
                    showClear
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>Nie znaleziono twórców.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <p className="text-xs text-muted-foreground">
                Gdy ustawione, koła będą kręcić się normalnie, ale zawsze zatrzymają się na wybranym twórcy.
              </p>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
