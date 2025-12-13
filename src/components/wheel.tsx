import { useEffect, useRef, useState } from 'react'
import { t } from '@/lib/translations'

export interface Creator {
  id: string
  username: string
  youtubeUrl: string
}

interface WheelProps {
  creators: Array<Creator>
  onSpinEnd: (creator: Creator) => void
  isSpinning: boolean
  onSpinStart: () => void
  onSpinComplete: () => void
  riggedCreator?: Creator | null
}

export function Wheel({
  creators,
  onSpinEnd,
  isSpinning,
  onSpinStart,
  onSpinComplete,
  riggedCreator,
}: WheelProps) {
  const [rotation, setRotation] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [duration, setDuration] = useState(0)
  const animationRef = useRef<number | null>(null)
  const isAnimatingRef = useRef(false)

  useEffect(() => {
    if (isSpinning && !isAnimatingRef.current) {
      spin()
    }
  }, [isSpinning])

  const spin = () => {
    if (creators.length === 0) return
    if (isAnimatingRef.current) return // Prevent multiple simultaneous spins

    isAnimatingRef.current = true
    setIsAnimating(true)
    onSpinStart()

    // Random speed (3-6 seconds) and random rotations
    // When rigged, ensure minimum spins for realism (at least 7 full rotations)
    // When not rigged, use 5-10 full rotations
    const spinDuration = 3000 + Math.random() * 3000 // 3-6 seconds
    setDuration(spinDuration)
    const fullRotations = riggedCreator
      ? 7 + Math.random() * 5 // 7-12 full rotations when rigged (more dramatic)
      : 5 + Math.random() * 5 // 5-10 full rotations when random
    const totalRotation = fullRotations * 360

    // Select creator - use rigged creator if provided, otherwise random
    let selectedCreator: Creator
    let selectedIndex: number

    if (riggedCreator) {
      selectedCreator = riggedCreator
      selectedIndex = creators.findIndex((c) => c.id === riggedCreator.id)
      // If rigged creator not found, fall back to random
      if (selectedIndex === -1) {
        selectedIndex = Math.floor(Math.random() * creators.length)
        selectedCreator = creators[selectedIndex]
      }
    } else {
      selectedIndex = Math.floor(Math.random() * creators.length)
      selectedCreator = creators[selectedIndex]
    }

    // Calculate angle per segment
    const anglePerSegment = 360 / creators.length

    // Calculate the center angle of the selected segment in wheel coordinates
    // In the wheel's coordinate system (before any rotation):
    // - Segment 0 starts at 0° and goes to anglePerSegment°, center at anglePerSegment/2°
    // - Segment 1 starts at anglePerSegment° and goes to 2*anglePerSegment°, center at 1.5*anglePerSegment°
    // - etc.
    // Note: Due to the -90° offset in createPath, segment 0's start appears at the top when rotation=0
    const segmentCenterAngle =
      selectedIndex * anglePerSegment + anglePerSegment / 2

    // The pointer is fixed at the top (0° in screen coordinates)
    // We want the selected segment's center to align with the pointer
    // When the wheel rotates clockwise by X degrees, segment center moves X degrees clockwise
    // To align segment center (at segmentCenterAngle) with pointer (at 0°):
    // We need: rotation + segmentCenterAngle ≡ 0 (mod 360)
    // Therefore: rotation ≡ -segmentCenterAngle ≡ 360 - segmentCenterAngle (mod 360)
    const targetAngle = (360 - segmentCenterAngle) % 360

    // Add randomness only if not rigged, otherwise use precise angle
    let finalAngle: number
    if (riggedCreator) {
      // When rigged, use precise angle with no randomness to ensure it lands correctly
      finalAngle = targetAngle
    } else {
      // Normal randomness for non-rigged spins
      const randomness = (Math.random() - 0.5) * (anglePerSegment * 0.3)
      finalAngle = targetAngle + randomness
    }

    // Normalize finalAngle to 0-360 range
    finalAngle = ((finalAngle % 360) + 360) % 360

    // Calculate the current normalized rotation (0-360)
    const currentNormalized = ((rotation % 360) + 360) % 360

    // Calculate the minimum rotation needed to reach the target angle
    // This is the shortest path from current position to target
    let minRotationToTarget = finalAngle - currentNormalized
    if (minRotationToTarget < 0) {
      minRotationToTarget += 360
    }

    // Calculate additional rotation needed
    // We want: full rotations + adjustment to reach target
    // additionalRotation = totalRotation + minRotationToTarget
    let additionalRotation = totalRotation + minRotationToTarget

    // Ensure we always rotate forward (positive) - should already be positive, but just in case
    if (additionalRotation < 0) {
      // Add enough 360s to make it positive
      const fullRotationsNeeded = Math.ceil(Math.abs(additionalRotation) / 360)
      additionalRotation += fullRotationsNeeded * 360
    }

    // For rigged spins, verify the final rotation will be correct
    if (riggedCreator) {
      const newRotation = rotation + additionalRotation
      const finalNormalized = ((newRotation % 360) + 360) % 360
      // Verify it matches (with small tolerance for floating point)
      const diff = Math.abs(finalNormalized - finalAngle)
      if (diff > 1 && diff < 359) {
        // Adjust if needed (shouldn't happen, but just in case)
        const correction = finalAngle - finalNormalized
        additionalRotation += correction
      }
    }

    setRotation((prev) => prev + additionalRotation)

    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }

    animationRef.current = window.setTimeout(() => {
      isAnimatingRef.current = false
      setIsAnimating(false)
      onSpinComplete()
      onSpinEnd(selectedCreator)
      animationRef.current = null
    }, spinDuration)
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
        animationRef.current = null
      }
      isAnimatingRef.current = false
    }
  }, [])

  if (creators.length === 0) {
    return (
      <div className="flex items-center justify-center w-full aspect-square rounded-full border-4 border-border bg-muted">
        <p className="text-muted-foreground text-center px-4">
          {t('addCreatorsToSpin')}
        </p>
      </div>
    )
  }

  const anglePerSegment = 360 / creators.length
  const radius = 160
  const centerX = 160
  const centerY = 160
  const colors = ['#d946ef', '#a855f7', '#8b5cf6', '#7c3aed', '#6d28d9']

  const createPath = (startAngle: number, endAngle: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180
    const endRad = ((endAngle - 90) * Math.PI) / 180
    const x1 = centerX + radius * Math.cos(startRad)
    const y1 = centerY + radius * Math.sin(startRad)
    const x2 = centerX + radius * Math.cos(endRad)
    const y2 = centerY + radius * Math.sin(endRad)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
  }

  return (
    <div className="relative w-full aspect-square">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 320 320"
        className="rounded-full border-4 border-foreground shadow-lg overflow-visible"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isAnimating
            ? `transform ${duration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
            : 'none',
        }}
      >
        {creators.map((creator, index) => {
          const startAngle = index * anglePerSegment
          const endAngle = (index + 1) * anglePerSegment
          const midAngle = (startAngle + endAngle) / 2
          const color = colors[index % colors.length]
          const textRadius = radius * 0.7
          const textX =
            centerX + textRadius * Math.cos(((midAngle - 90) * Math.PI) / 180)
          const textY =
            centerY + textRadius * Math.sin(((midAngle - 90) * Math.PI) / 180)

          return (
            <g key={creator.id}>
              <path
                d={createPath(startAngle, endAngle)}
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={textX}
                y={textY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
                fontWeight="600"
                transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                className="pointer-events-none"
              >
                {creator.username.length > 15
                  ? creator.username.substring(0, 15) + '...'
                  : creator.username}
              </text>
            </g>
          )
        })}
      </svg>
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
        <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-foreground"></div>
      </div>
    </div>
  )
}
