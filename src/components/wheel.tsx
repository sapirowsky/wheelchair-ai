import { useEffect, useRef, useState } from 'react'

export interface Creator {
  id: string
  username: string
  youtubeUrl: string
}

export interface Impediment {
  id: string
  name: string
  description?: string
}

interface WheelProps {
  creators: Array<Creator>
  onSpinEnd: (creator: Creator) => void
  isSpinning: boolean
  onSpinStart: () => void
  onSpinComplete: () => void
  riggedCreator?: Creator | null
  onClick?: () => void
}

export function Wheel({
  creators,
  onSpinEnd,
  isSpinning,
  onSpinStart,
  onSpinComplete,
  riggedCreator,
  onClick,
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

      if (selectedIndex === -1) {
        selectedIndex = Math.floor(Math.random() * creators.length)
        selectedCreator = creators[selectedIndex]
      }
    } else {
      selectedIndex = Math.floor(Math.random() * creators.length)
      selectedCreator = creators[selectedIndex]
    }

    const anglePerSegment = 360 / creators.length

    const segmentCenterAngle =
      selectedIndex * anglePerSegment + anglePerSegment / 2

    const targetAngle = (360 - segmentCenterAngle) % 360

    let finalAngle: number
    if (riggedCreator) {
      finalAngle = targetAngle
    } else {
      const randomness = (Math.random() - 0.5) * (anglePerSegment * 0.3)
      finalAngle = targetAngle + randomness
    }

    finalAngle = ((finalAngle % 360) + 360) % 360

    const currentNormalized = ((rotation % 360) + 360) % 360

    let minRotationToTarget = finalAngle - currentNormalized
    if (minRotationToTarget < 0) {
      minRotationToTarget += 360
    }

    let additionalRotation = totalRotation + minRotationToTarget

    if (additionalRotation < 0) {
      const fullRotationsNeeded = Math.ceil(Math.abs(additionalRotation) / 360)
      additionalRotation += fullRotationsNeeded * 360
    }

    if (riggedCreator) {
      const newRotation = rotation + additionalRotation
      const finalNormalized = ((newRotation % 360) + 360) % 360
      const diff = Math.abs(finalNormalized - finalAngle)
      if (diff > 1 && diff < 359) {
        const correction = finalAngle - finalNormalized
        additionalRotation += correction
      }
    }

    setRotation((prev) => prev + additionalRotation)

    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }

    // Calculate the actual winning creator based on final rotation
    // Store the final rotation value to use in the timeout callback
    const finalRotationValue = rotation + additionalRotation
    const calculateWinningCreator = () => {
      const finalNormalized = ((finalRotationValue % 360) + 360) % 360
      // Pointer is at top (0 degrees)
      // After rotation, we need to find which segment is at the top
      // The wheel rotates clockwise, so a segment originally at angle theta
      // is now at angle (theta + finalNormalized) % 360
      // We need to find which segment's range includes 0 degrees
      // The segment that was originally at angle (360 - finalNormalized) % 360
      // is now at the top (0 degrees)
      const originalAngleAtTop = (360 - finalNormalized) % 360
      const winningIndex =
        Math.floor(originalAngleAtTop / anglePerSegment) % creators.length
      return creators[winningIndex]
    }

    animationRef.current = window.setTimeout(() => {
      isAnimatingRef.current = false
      setIsAnimating(false)
      onSpinComplete()
      // For rigged mode, use the selected creator (it should land exactly on it)
      // For random mode, calculate the actual winner based on where it landed
      const actualWinner = riggedCreator
        ? selectedCreator
        : calculateWinningCreator()
      onSpinEnd(actualWinner)
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
          Dodaj twórców, aby zakręcić
        </p>
      </div>
    )
  }

  const anglePerSegment = 360 / creators.length
  const radius = 160
  const centerX = 160
  const centerY = 160

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

  const canClick = onClick && creators.length > 0 && !isSpinning && !isAnimating

  return (
    <div
      className={`relative w-full aspect-square ${
        canClick ? 'cursor-pointer' : ''
      }`}
      onClick={canClick ? onClick : undefined}
    >
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
          // const color = colors[index % colors.length]
          const color = index % 3 === 0 ? 'black' : 'white'
          const textColor = index % 3 === 0 ? 'white' : 'black'
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
                stroke="black"
                strokeWidth=".5"
              />
              <text
                x={textX}
                y={textY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={textColor}
                fontSize="8"
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
      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 size-24 bg-black  rounded-full  z-20 flex items-center justify-center">
        <span className="text-white text-xs font-bold uppercase">
          Wheelchair
        </span>
      </div>
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
        <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-foreground"></div>
      </div>
    </div>
  )
}
