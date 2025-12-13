import { CreatorManager } from './creator-manager'
import type { Creator } from './wheel'
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
import { t } from '@/lib/translations'

interface SettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  creators: Array<Creator>
  onCreatorsChange: (creators: Array<Creator>) => void
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
  wheel1Rigged,
  wheel2Rigged,
  onWheel1RiggedChange,
  onWheel2RiggedChange,
  maxCreatorsToShow,
  onMaxCreatorsToShowChange,
}: SettingsSheetProps) {
  // Create items array - use usernames as values for display, but map to IDs
  const wheel1Items = [t('randomNoRig'), ...creators.map((c) => c.username)]

  const wheel2Items = [t('randomNoRig'), ...creators.map((c) => c.username)]

  const wheel1Value = wheel1Rigged?.username || t('randomNoRig')
  const wheel2Value = wheel2Rigged?.username || t('randomNoRig')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{t('settings')}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          <Card>
            <CardHeader>
              <CardTitle>{t('wheelSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-creators">{t('maxCreatorsToShow')}</Label>
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
                  placeholder={t('allCreators')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('maxCreatorsDescription')}
                </p>
              </div>
            </CardContent>
          </Card>

          <CreatorManager
            creators={creators}
            onCreatorsChange={onCreatorsChange}
          />

          <Card>
            <CardHeader>
              <CardTitle>{t('rigWheels')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wheel1-rig">{t('wheel1Preselected')}</Label>
                <Combobox
                  items={wheel1Items}
                  value={wheel1Value}
                  onValueChange={(value) => {
                    if (value === t('randomNoRig') || !value) {
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
                    placeholder={t('selectCreatorOrSearch')}
                    className="w-full"
                    showClear
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>{t('noCreatorsFound')}</ComboboxEmpty>
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
                <Label htmlFor="wheel2-rig">{t('wheel2Preselected')}</Label>
                <Combobox
                  items={wheel2Items}
                  value={wheel2Value}
                  onValueChange={(value) => {
                    if (value === t('randomNoRig') || !value) {
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
                    placeholder={t('selectCreatorOrSearch')}
                    className="w-full"
                    showClear
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>{t('noCreatorsFound')}</ComboboxEmpty>
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
                {t('rigDescription')}
              </p>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
