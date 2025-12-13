import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { ExternalLink, Play, RotateCw, Settings } from 'lucide-react'
import type { Creator } from '@/components/wheel'
import { Wheel } from '@/components/wheel'
import { SpinHistory } from '@/components/spin-history'
import { SettingsSheet } from '@/components/settings-sheet'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { t } from '@/lib/translations'

export const Route = createFileRoute('/')({ component: App })

interface SpinHistoryEntry {
  id: string
  timestamp: Date
  wheel1Creator: Creator | null
  wheel2Creator: Creator | null
}

function App() {
  const [creators, setCreators] = useState<Array<Creator>>([])
  const [history, setHistory] = useState<Array<SpinHistoryEntry>>([])

  const [wheel1Spinning, setWheel1Spinning] = useState(false)
  const [wheel2Spinning, setWheel2Spinning] = useState(false)
  const [wheel1Complete, setWheel1Complete] = useState(false)
  const [wheel2Complete, setWheel2Complete] = useState(false)
  const [bothWheelsSpinning, setBothWheelsSpinning] = useState(false)

  const [wheel1Result, setWheel1Result] = useState<Creator | null>(null)
  const [wheel2Result, setWheel2Result] = useState<Creator | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [wheel1Rigged, setWheel1Rigged] = useState<Creator | null>(null)
  const [wheel2Rigged, setWheel2Rigged] = useState<Creator | null>(null)
  const [maxCreatorsToShow, setMaxCreatorsToShow] = useState<number>(0)
  const [wheel1Creators, setWheel1Creators] = useState<Array<Creator>>([])
  const [wheel2Creators, setWheel2Creators] = useState<Array<Creator>>([])

  // Load from localStorage
  useEffect(() => {
    const savedCreators = localStorage.getItem('wheel-creators')
    const savedHistory = localStorage.getItem('wheel-history')
    const savedWheel1Rigged = localStorage.getItem('wheel-1-rigged')
    const savedWheel2Rigged = localStorage.getItem('wheel-2-rigged')
    const savedMaxCreatorsToShow = localStorage.getItem('max-creators-to-show')

    if (savedCreators) {
      try {
        const parsed = JSON.parse(savedCreators)
        setCreators(parsed)
      } catch (e) {
        console.error('Failed to load creators', e)
      }
    }

    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        // Convert timestamp strings back to Date objects
        const historyWithDates = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
          wheel1Creator: entry.wheel1Creator
            ? { ...entry.wheel1Creator }
            : null,
          wheel2Creator: entry.wheel2Creator
            ? { ...entry.wheel2Creator }
            : null,
        }))
        setHistory(historyWithDates)
      } catch (e) {
        console.error('Failed to load history', e)
      }
    }

    // Load rigged creators after creators are loaded
    if (savedWheel1Rigged) {
      try {
        const parsed = JSON.parse(savedWheel1Rigged)
        // Validate that the rigged creator still exists in the creators list
        // This will be checked after creators are loaded
        setWheel1Rigged(parsed)
      } catch (e) {
        console.error('Failed to load wheel 1 rigged', e)
      }
    }

    if (savedWheel2Rigged) {
      try {
        const parsed = JSON.parse(savedWheel2Rigged)
        setWheel2Rigged(parsed)
      } catch (e) {
        console.error('Failed to load wheel 2 rigged', e)
      }
    }

    if (savedMaxCreatorsToShow) {
      try {
        const parsed = parseInt(savedMaxCreatorsToShow, 10)
        if (!isNaN(parsed) && parsed > 0) {
          setMaxCreatorsToShow(parsed)
        }
      } catch (e) {
        console.error('Failed to load max creators to show', e)
      }
    }
  }, [])

  // Validate rigged creators exist in current creators list
  useEffect(() => {
    if (wheel1Rigged && creators.length > 0) {
      const exists = creators.some((c) => c.id === wheel1Rigged.id)
      if (!exists) {
        setWheel1Rigged(null)
      }
    }
  }, [creators, wheel1Rigged])

  useEffect(() => {
    if (wheel2Rigged && creators.length > 0) {
      const exists = creators.some((c) => c.id === wheel2Rigged.id)
      if (!exists) {
        setWheel2Rigged(null)
      }
    }
  }, [creators, wheel2Rigged])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('wheel-creators', JSON.stringify(creators))
  }, [creators])

  useEffect(() => {
    localStorage.setItem('wheel-history', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    if (wheel1Rigged) {
      localStorage.setItem('wheel-1-rigged', JSON.stringify(wheel1Rigged))
    } else {
      localStorage.removeItem('wheel-1-rigged')
    }
  }, [wheel1Rigged])

  useEffect(() => {
    if (wheel2Rigged) {
      localStorage.setItem('wheel-2-rigged', JSON.stringify(wheel2Rigged))
    } else {
      localStorage.removeItem('wheel-2-rigged')
    }
  }, [wheel2Rigged])

  useEffect(() => {
    if (maxCreatorsToShow > 0) {
      localStorage.setItem('max-creators-to-show', maxCreatorsToShow.toString())
    } else {
      localStorage.removeItem('max-creators-to-show')
    }
  }, [maxCreatorsToShow])

  // Function to randomly select creators for wheel
  const getRandomCreators = useCallback(
    (
      allCreators: Array<Creator>,
      riggedCreator: Creator | null,
    ): Array<Creator> => {
      if (maxCreatorsToShow <= 0 || allCreators.length <= maxCreatorsToShow) {
        return allCreators
      }

      // If rigged creator is set, ensure it's included
      if (riggedCreator) {
        const riggedExists = allCreators.some((c) => c.id === riggedCreator.id)
        if (!riggedExists) {
          // Rigged creator not in list, return all
          return allCreators
        }

        // Create array without rigged creator, shuffle, and take (maxCreatorsToShow - 1)
        const withoutRigged = allCreators.filter(
          (c) => c.id !== riggedCreator.id,
        )
        const shuffled = [...withoutRigged].sort(() => Math.random() - 0.5)
        const selected = shuffled.slice(0, maxCreatorsToShow - 1)
        // Add rigged creator and shuffle the final array (so it's not always first)
        const result = [...selected, riggedCreator].sort(
          () => Math.random() - 0.5,
        )
        return result
      }

      // No rigged creator, just randomly select
      const shuffled = [...allCreators].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, maxCreatorsToShow)
    },
    [maxCreatorsToShow],
  )

  // Update wheel creators immediately when settings change
  useEffect(() => {
    if (creators.length === 0) {
      setWheel1Creators([])
      setWheel2Creators([])
      return
    }

    // Update wheel 1 creators based on current settings
    const wheel1Selected = getRandomCreators(creators, wheel1Rigged)
    setWheel1Creators(wheel1Selected)

    // Update wheel 2 creators based on current settings
    const wheel2Selected = getRandomCreators(creators, wheel2Rigged)
    setWheel2Creators(wheel2Selected)
  }, [getRandomCreators, creators, wheel1Rigged, wheel2Rigged])

  const handleSpinWheel1 = () => {
    if (creators.length === 0) return
    const selectedCreators = getRandomCreators(creators, wheel1Rigged)
    setWheel1Creators(selectedCreators)
    setWheel1Spinning(true)
    setBothWheelsSpinning(false)
    setWheel1Complete(false)
    setWheel1Result(null)
  }

  const handleSpinWheel2 = () => {
    if (creators.length === 0) return
    const selectedCreators = getRandomCreators(creators, wheel2Rigged)
    setWheel2Creators(selectedCreators)
    setWheel2Spinning(true)
    setBothWheelsSpinning(false)
    setWheel2Complete(false)
    setWheel2Result(null)
  }

  const handleRandomizeWheel1 = () => {
    if (creators.length === 0) return
    const selectedCreators = getRandomCreators(creators, wheel1Rigged)
    setWheel1Creators(selectedCreators)
  }

  const handleRandomizeWheel2 = () => {
    if (creators.length === 0) return
    const selectedCreators = getRandomCreators(creators, wheel2Rigged)
    setWheel2Creators(selectedCreators)
  }

  const shouldShowRandomizeButtons =
    maxCreatorsToShow > 0 && maxCreatorsToShow < creators.length

  const handleSpinBoth = () => {
    if (creators.length === 0) return
    const selectedCreators1 = getRandomCreators(creators, wheel1Rigged)
    const selectedCreators2 = getRandomCreators(creators, wheel2Rigged)
    setWheel1Creators(selectedCreators1)
    setWheel2Creators(selectedCreators2)
    setWheel1Spinning(true)
    setWheel2Spinning(true)
    setBothWheelsSpinning(true)
    setWheel1Complete(false)
    setWheel2Complete(false)
    setWheel1Result(null)
    setWheel2Result(null)
  }

  const handleWheel1SpinEnd = (creator: Creator) => {
    setWheel1Result(creator)
    setWheel1Complete(true)
  }

  const handleWheel2SpinEnd = (creator: Creator) => {
    setWheel2Result(creator)
    setWheel2Complete(true)
  }

  // Check when to show modal
  useEffect(() => {
    if (bothWheelsSpinning && wheel1Complete && wheel2Complete) {
      // Both wheels completed
      setShowModal(true)
    } else if (!bothWheelsSpinning) {
      // Single wheel spin - show modal when that wheel completes
      if (wheel1Complete && wheel1Result) {
        setShowModal(true)
      } else if (wheel2Complete && wheel2Result) {
        setShowModal(true)
      }
    }
  }, [
    wheel1Complete,
    wheel2Complete,
    bothWheelsSpinning,
    wheel1Result,
    wheel2Result,
  ])

  const handleWheel1SpinStart = () => {
    setWheel1Spinning(true)
  }

  const handleWheel1SpinComplete = () => {
    setWheel1Spinning(false)
  }

  const handleWheel2SpinStart = () => {
    setWheel2Spinning(true)
  }

  const handleWheel2SpinComplete = () => {
    setWheel2Spinning(false)
  }

  const handleModalClose = () => {
    setShowModal(false)

    // Save to history
    if (wheel1Result || wheel2Result) {
      const newEntry: SpinHistoryEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        wheel1Creator: wheel1Result,
        wheel2Creator: wheel2Result,
      }
      setHistory([...history, newEntry])
    }

    // Reset results
    setWheel1Result(null)
    setWheel2Result(null)
    setWheel1Complete(false)
    setWheel2Complete(false)
    setBothWheelsSpinning(false)
  }

  const canSpinWheel1 = creators.length > 0 && !wheel1Spinning
  const canSpinWheel2 = creators.length > 0 && !wheel2Spinning
  const canSpinBoth = creators.length > 0 && !wheel1Spinning && !wheel2Spinning

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1"></div>
            <h1 className="text-4xl font-bold flex-1">{t('wheelOfFortune')}</h1>
            <div className="flex-1 flex justify-end">
              <Button variant="outline" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4 mr-2" />
                {t('settings')}
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            {t('spinToSelectCreators')}
          </p>
        </div>

        <div className="space-y-6">
          {/* Main wheels section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
              {/* Wheel 1 */}
              <div className="flex flex-col items-center gap-4 w-full">
                <h2 className="text-xl font-semibold">{t('wheel1')}</h2>
                <Wheel
                  creators={
                    wheel1Creators.length > 0 ? wheel1Creators : creators
                  }
                  onSpinEnd={handleWheel1SpinEnd}
                  isSpinning={wheel1Spinning}
                  onSpinStart={handleWheel1SpinStart}
                  onSpinComplete={handleWheel1SpinComplete}
                  riggedCreator={wheel1Rigged}
                />
                <div className="flex flex-col gap-2 w-full items-center">
                  <Button
                    onClick={handleSpinWheel1}
                    disabled={!canSpinWheel1}
                    size="lg"
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {t('spinWheel1')}
                  </Button>
                  {shouldShowRandomizeButtons && (
                    <Button
                      onClick={handleRandomizeWheel1}
                      disabled={wheel1Spinning}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      {t('randomizeWheel1')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Wheel 2 */}
              <div className="flex flex-col items-center gap-4 w-full">
                <h2 className="text-xl font-semibold">{t('wheel2')}</h2>
                <Wheel
                  creators={
                    wheel2Creators.length > 0 ? wheel2Creators : creators
                  }
                  onSpinEnd={handleWheel2SpinEnd}
                  isSpinning={wheel2Spinning}
                  onSpinStart={handleWheel2SpinStart}
                  onSpinComplete={handleWheel2SpinComplete}
                  riggedCreator={wheel2Rigged}
                />
                <div className="flex flex-col gap-2 w-full items-center">
                  <Button
                    onClick={handleSpinWheel2}
                    disabled={!canSpinWheel2}
                    size="lg"
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {t('spinWheel2')}
                  </Button>
                  {shouldShowRandomizeButtons && (
                    <Button
                      onClick={handleRandomizeWheel2}
                      disabled={wheel2Spinning}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      {t('randomizeWheel2')}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Spin Both Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSpinBoth}
                disabled={!canSpinBoth}
                size="lg"
                variant="secondary"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                {t('spinBothWheels')}
              </Button>
            </div>

            {/* Spin History under wheels */}
            <SpinHistory history={history} />
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <AlertDialog open={showModal} onOpenChange={setShowModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('selectedCreator')}</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 mt-4">
                {wheel1Result && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('wheel1Label')}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold">
                        {wheel1Result.username}
                      </p>
                      <a
                        href={wheel1Result.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('openYouTube')}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
                {wheel2Result && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('wheel2Label')}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold">
                        {wheel2Result.username}
                      </p>
                      <a
                        href={wheel2Result.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t('openYouTube')}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={handleModalClose}>{t('close')}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Settings Sheet */}
      <SettingsSheet
        open={showSettings}
        onOpenChange={setShowSettings}
        creators={creators}
        onCreatorsChange={setCreators}
        wheel1Rigged={wheel1Rigged}
        wheel2Rigged={wheel2Rigged}
        onWheel1RiggedChange={setWheel1Rigged}
        onWheel2RiggedChange={setWheel2Rigged}
        maxCreatorsToShow={maxCreatorsToShow}
        onMaxCreatorsToShowChange={setMaxCreatorsToShow}
      />
    </div>
  )
}
