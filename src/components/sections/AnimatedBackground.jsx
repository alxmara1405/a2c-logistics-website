import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animationId
    let particles = []
    let lines = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Floating particles — subtle dots suggesting freight network nodes
    class Particle {
      constructor() {
        this.reset()
      }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = (Math.random() - 0.3) * 0.8 // bias rightward (forward motion)
        this.speedY = (Math.random() - 0.5) * 0.4
        this.opacity = Math.random() * 0.4 + 0.1
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x > canvas.width + 10) this.x = -10
        if (this.x < -10) this.x = canvas.width + 10
        if (this.y > canvas.height + 10 || this.y < -10) this.reset()
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(239, 57, 44, ${this.opacity})`
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
        this.length = Math.random() * 150 + 80
        this.speed = Math.random() * 3 + 1.5
        this.opacity = Math.random() * 0.07 + 0.02
        this.width = Math.random() * 1.5 + 0.5
      }
      update() {
        this.x += this.speed
        if (this.x > canvas.width + 200) this.reset()
      }
      draw() {
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x + this.length, this.y)
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`
        ctx.lineWidth = this.width
        ctx.stroke()
      }
    }

    // Initialize
    const particleCount = Math.min(80, Math.floor(canvas.width / 15))
    const lineCount = Math.min(25, Math.floor(canvas.width / 60))

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }
    for (let i = 0; i < lineCount; i++) {
      const line = new MotionLine()
      line.x = Math.random() * canvas.width // spread initial positions
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
            const opacity = (1 - dist / 150) * 0.08
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

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Motion lines (behind everything)
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
