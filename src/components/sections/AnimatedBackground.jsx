import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animationId
    let particles = []
    let lines = []
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Track mouse position for parallax
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2  // -1 to 1
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2 // -1 to 1
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Edge fade — returns 0-1 based on distance from edges
    const edgeFade = (x, y) => {
      const margin = 120
      const fadeX = Math.min(x / margin, (canvas.width - x) / margin, 1)
      const fadeY = Math.min(y / margin, (canvas.height - y) / margin, 1)
      return Math.max(0, Math.min(1, fadeX)) * Math.max(0, Math.min(1, fadeY))
    }

    // Floating particles — subtle dots suggesting freight network nodes
    class Particle {
      constructor() {
        this.reset()
        // Depth layer: 0 = far/slow, 1 = mid, 2 = close/fast
        this.depth = Math.floor(Math.random() * 3)
        this.parallaxFactor = (this.depth + 1) * 6
      }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.baseX = this.x
        this.baseY = this.y
        this.size = Math.random() * 2 + 0.5
        this.speedX = (Math.random() - 0.3) * 0.8
        this.speedY = (Math.random() - 0.5) * 0.4
        this.opacity = Math.random() * 0.4 + 0.1
      }
      update() {
        this.baseX += this.speedX
        this.baseY += this.speedY

        // Apply mouse parallax based on depth
        this.x = this.baseX + mouseRef.current.x * this.parallaxFactor
        this.y = this.baseY + mouseRef.current.y * this.parallaxFactor

        if (this.baseX > canvas.width + 10) this.baseX = -10
        if (this.baseX < -10) this.baseX = canvas.width + 10
        if (this.baseY > canvas.height + 10 || this.baseY < -10) {
          this.reset()
          this.baseX = this.baseX < canvas.width / 2 ? -10 : canvas.width + 10
        }
      }
      draw() {
        const fade = edgeFade(this.x, this.y)
        if (fade <= 0) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(239, 57, 44, ${this.opacity * fade})`
        ctx.fill()
      }
    }

    // Horizontal motion lines — suggesting highways / speed
    class MotionLine {
      constructor() {
        this.reset()
      }
      reset() {
        this.x = -200 - Math.random() * 400
        this.y = Math.random() * canvas.height
        // Depth-based speed variation: some lines much faster (close) vs slow (far)
        this.depth = Math.random()
        this.length = this.depth * 180 + 40  // far = short, close = long
        this.speed = this.depth * 5 + 0.8     // far = slow, close = fast
        this.opacity = this.depth * 0.06 + 0.015 // far = faint, close = brighter
        this.width = this.depth * 1.8 + 0.3
        this.parallaxFactor = this.depth * 10
      }
      update() {
        this.x += this.speed
        if (this.x > canvas.width + 200) this.reset()
      }
      draw() {
        const offsetY = mouseRef.current.y * this.parallaxFactor
        const drawY = this.y + offsetY
        const fade = edgeFade(this.x + this.length / 2, drawY)
        if (fade <= 0) return

        // Gradient along the line for a streak effect
        const gradient = ctx.createLinearGradient(this.x, drawY, this.x + this.length, drawY)
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`)
        gradient.addColorStop(0.3, `rgba(255, 255, 255, ${this.opacity * fade})`)
        gradient.addColorStop(0.7, `rgba(255, 255, 255, ${this.opacity * fade})`)
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`)

        ctx.beginPath()
        ctx.moveTo(this.x, drawY)
        ctx.lineTo(this.x + this.length, drawY)
        ctx.strokeStyle = gradient
        ctx.lineWidth = this.width
        ctx.stroke()
      }
    }

    // Initialize
    const particleCount = Math.min(80, Math.floor(canvas.width / 15))
    const lineCount = Math.min(30, Math.floor(canvas.width / 50))

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }
    for (let i = 0; i < lineCount; i++) {
      const line = new MotionLine()
      line.x = Math.random() * canvas.width
      lines.push(line)
    }

    // Draw connections between nearby particles
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            const fade = Math.min(
              edgeFade(particles[i].x, particles[i].y),
              edgeFade(particles[j].x, particles[j].y)
            )
            if (fade <= 0) continue
            const opacity = (1 - dist / 150) * 0.08 * fade
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(239, 57, 44, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    // Red glow pulse behind center
    const drawGlow = () => {
      const pulse = Math.sin(time * 0.008) * 0.3 + 0.7 // 0.4 to 1.0
      const cx = canvas.width / 2 + mouseRef.current.x * 20
      const cy = canvas.height / 2 + mouseRef.current.y * 20
      const radius = Math.min(canvas.width, canvas.height) * 0.45

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      gradient.addColorStop(0, `rgba(239, 57, 44, ${0.06 * pulse})`)
      gradient.addColorStop(0.5, `rgba(239, 57, 44, ${0.03 * pulse})`)
      gradient.addColorStop(1, 'rgba(239, 57, 44, 0)')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const animate = () => {
      time++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Red glow pulse (behind everything)
      drawGlow()

      // Motion lines
      lines.forEach((line) => {
        line.update()
        line.draw()
      })

      // Particles
      particles.forEach((p) => {
        p.update()
        p.draw()
      })

      // Network connections
      drawConnections()

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  )
}
