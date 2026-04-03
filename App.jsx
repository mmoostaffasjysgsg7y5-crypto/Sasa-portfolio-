import { useEffect, useRef, useState, useCallback } from 'react'
import './App.css'

/* ─── Cursor ─────────────────────────────────────────────────── */
function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0
    let raf

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
    }

    const tick = () => {
      rx += (mx - rx) * 0.15
      ry += (my - ry) * 0.15
      if (dotRef.current) {
        dotRef.current.style.left = mx + 'px'
        dotRef.current.style.top = my + 'px'
      }
      if (ringRef.current) {
        ringRef.current.style.left = rx + 'px'
        ringRef.current.style.top = ry + 'px'
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  )
}

/* ─── Particles ──────────────────────────────────────────────── */
function Particles({ count = 40 }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    duration: 6 + Math.random() * 10,
    delay: Math.random() * 8,
    size: 1 + Math.random() * 3,
    drift: (Math.random() - 0.5) * 60,
    top: Math.random() * 100,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #FFD700 0%, transparent 100%)',
            '--drift': `${p.drift}px`,
            animationName: 'particleDrift',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  )
}

/* ─── Scroll reveal hook ─────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal-hidden, .reveal-hidden-left, .reveal-hidden-right')

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target
          if (el.classList.contains('reveal-hidden')) {
            el.classList.add('reveal-visible')
          } else if (el.classList.contains('reveal-hidden-left')) {
            el.classList.add('reveal-visible-left')
          } else if (el.classList.contains('reveal-hidden-right')) {
            el.classList.add('reveal-visible-right')
          }
          obs.unobserve(el)
        }
      })
    }, { threshold: 0.12 })

    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

/* ─── Count-up ───────────────────────────────────────────────── */
function useCountUp(target, duration = 2000, start = false) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    if (!start) return
    const startTime = performance.now()
    const numeric = typeof target === 'string' ? parseFloat(target.replace(/[^0-9.]/g, '')) : target

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * numeric))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
      else setValue(numeric)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [start, target, duration])

  return value
}

/* ─── Stat Card ──────────────────────────────────────────────── */
function StatCard({ icon, platform, value, suffix = '+', color, started }) {
  const numeric = parseFloat(value.toString().replace(/[^0-9.]/g, ''))
  const count = useCountUp(numeric, 2200, started)

  const fmt = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
    return n.toLocaleString()
  }

  return (
    <div className="glass-card shimmer-card rounded-2xl p-6 flex flex-col items-center gap-3 hover:scale-105 transition-transform duration-300 cursor-default"
      style={{ border: '1px solid rgba(234,179,8,0.2)' }}>
      <div className="text-3xl">{icon}</div>
      <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: color || '#DAA520' }}>{platform}</p>
      <p className="stat-number text-4xl font-bold text-gold-gradient" style={{ fontFamily: 'Cinzel, serif' }}>
        {started ? fmt(count) : '0'}{suffix}
      </p>
      <p className="text-xs text-gray-500">Followers</p>
    </div>
  )
}

/* ─── Tilt Card ──────────────────────────────────────────────── */
function TiltCard({ children, className = '' }) {
  const cardRef = useRef(null)

  const onMove = useCallback((e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    card.style.transform = `perspective(800px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) scale(1.02)`
  }, [])

  const onLeave = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)'
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  )
}

/* ─── Section Title ──────────────────────────────────────────── */
function SectionTitle({ label, title, sub }) {
  return (
    <div className="text-center mb-16 reveal-hidden">
      <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: '#B8860B' }}>{label}</p>
      <h2 className="text-4xl md:text-5xl font-black mb-4 text-gold-gradient" style={{ fontFamily: 'Cinzel, serif' }}>
        {title}
      </h2>
      {sub && <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">{sub}</p>}
      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #B8860B)' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: '#FFD700' }} />
        <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #B8860B, transparent)' }} />
      </div>
    </div>
  )
}

/* ─── Navbar ─────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const links = ['About', 'Stats', 'Content', 'Services', 'Contact']

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}
      style={{
        background: scrolled ? 'rgba(5,2,0,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(234,179,8,0.12)' : 'none',
      }}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#top" className="text-gold-gradient font-black text-xl tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
          SASA SALEH
        </a>
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              className="nav-link text-xs font-semibold tracking-widest uppercase transition-colors duration-300"
              style={{ color: '#9CA3AF' }}
              onMouseEnter={e => e.target.style.color = '#FFD700'}
              onMouseLeave={e => e.target.style.color = '#9CA3AF'}>
              {l}
            </a>
          ))}
          <a href="#contact"
            className="px-5 py-2 text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #B8860B, #FFD700)',
              color: '#000',
            }}>
            Book Now
          </a>
        </div>
        {/* Mobile hamburger */}
        <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {[0,1,2].map(i => (
            <span key={i} className="block w-6 h-0.5 transition-all duration-300" style={{ background: '#FFD700' }} />
          ))}
        </button>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-6 py-4 flex flex-col gap-4" style={{ background: 'rgba(5,2,0,0.97)', borderTop: '1px solid rgba(234,179,8,0.15)' }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              className="text-sm font-semibold tracking-widest uppercase"
              style={{ color: '#DAA520' }}
              onClick={() => setMenuOpen(false)}>
              {l}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}

/* ─── Hero Section ───────────────────────────────────────────── */
function HeroSection() {
  return (
    <section id="top" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background spotlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]"
          style={{ background: 'radial-gradient(ellipse at top, rgba(184,134,11,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(184,134,11,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text + circular image */}
          <div className="flex flex-col items-center lg:items-start gap-10">
            {/* Hero circle image */}
            <div className="relative reveal-hidden" style={{ animationDelay: '0.2s' }}>
              {/* Outer glow rings */}
              <div className="absolute inset-0 rounded-full anim-glow-pulse" style={{ margin: '-8px' }} />
              <div className="absolute inset-0 rounded-full ring-spin" style={{
                margin: '-16px',
                background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,215,0,0.6) 20%, transparent 40%, rgba(184,134,11,0.4) 60%, transparent 80%)',
                borderRadius: '50%',
              }} />
              {/* Main circle */}
              <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden anim-float"
                style={{
                  border: '3px solid rgba(255,215,0,0.5)',
                  boxShadow: '0 0 50px rgba(255,215,0,0.4), 0 0 100px rgba(184,134,11,0.25), inset 0 0 30px rgba(255,215,0,0.1)',
                }}>
                <img
                  src="/images/hero-main.jpeg"
                  alt="Sasa Saleh"
                  className="w-full h-full object-cover object-top"
                  style={{ transform: 'scale(1.05)', transition: 'transform 8s ease-in-out', animation: 'zoomIn 8s ease-in-out infinite alternate' }}
                />
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 px-3 py-1.5 rounded-full text-xs font-bold float-label"
                style={{ background: 'linear-gradient(135deg, #B8860B, #FFD700)', color: '#000', animationDelay: '0s', animation: 'floatAnim 5s ease-in-out infinite' }}>
                🎭 Actor
              </div>
              <div className="absolute -bottom-2 -left-6 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700', animation: 'floatAnim 7s ease-in-out infinite 1s' }}>
                🎤 Comedian
              </div>
              <div className="absolute top-1/2 -right-10 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700', animation: 'floatAnim 6s ease-in-out infinite 0.5s' }}>
                📱 Creator
              </div>
            </div>

            {/* Text */}
            <div className="text-center lg:text-left reveal-hidden" style={{ transitionDelay: '0.3s' }}>
              <p className="text-xs font-bold tracking-[0.4em] uppercase mb-3" style={{ color: '#B8860B' }}>
                Dubai, UAE · Entertainment
              </p>
              <h1 className="text-5xl md:text-7xl font-black leading-none mb-4 text-shadow-gold"
                style={{ fontFamily: 'Cinzel, serif', background: 'linear-gradient(135deg, #B8860B 0%, #FFD700 40%, #DAA520 70%, #B8860B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Sasa<br />Saleh
              </h1>
              <p className="text-base md:text-lg font-semibold tracking-widest uppercase mb-6" style={{ color: '#DAA520' }}>
                Actor · Stand-Up Comedian · Content Creator
              </p>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-8">
                A rising entertainer blending acting, stand-up comedy, and digital content to deliver engaging, relatable, and high-performing content across social media platforms. Built a fast-growing audience through humor, storytelling, and strong on-screen presence.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <a href="#contact"
                  className="px-8 py-3 font-bold text-sm tracking-widest uppercase rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #B8860B, #FFD700)', color: '#000', boxShadow: '0 4px 20px rgba(255,215,0,0.3)' }}>
                  Book Now
                </a>
                <a href="#stats"
                  className="px-8 py-3 font-bold text-sm tracking-widest uppercase rounded-full transition-all duration-300 hover:scale-105"
                  style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700' }}>
                  View Stats
                </a>
              </div>
            </div>
          </div>

          {/* Right: Side image */}
          <div className="flex justify-center lg:justify-end reveal-hidden-right">
            <TiltCard className="relative">
              <div className="glass-card rounded-3xl overflow-hidden shimmer-card"
                style={{
                  border: '1px solid rgba(255,215,0,0.2)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(184,134,11,0.15)',
                  maxWidth: '420px',
                }}>
                <img
                  src="/images/hero-side.jpeg"
                  alt="Sasa Saleh"
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: '580px', objectFit: 'cover', objectPosition: 'top' }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.7) 100%)' }} />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#B8860B' }}>Media Graduate</p>
                  <p className="text-white text-sm font-semibold">Al Mashreq University</p>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <p className="text-xs tracking-widest uppercase" style={{ color: '#B8860B' }}>Scroll</p>
        <div className="w-px h-12" style={{ background: 'linear-gradient(180deg, #B8860B, transparent)' }} />
      </div>
    </section>
  )
}

/* ─── About Section ──────────────────────────────────────────── */
function AboutSection() {
  return (
    <section id="about" className="relative py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          label="My Story"
          title="About Sasa"
          sub="Media graduate turned viral entertainer"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="reveal-hidden-left">
            <div className="glass-card shimmer-card rounded-3xl p-10"
              style={{ borderColor: 'rgba(184,134,11,0.2)' }}>
              <div className="w-12 h-1 mb-8 rounded-full" style={{ background: 'linear-gradient(90deg, #B8860B, #FFD700)' }} />
              <p className="text-gray-300 text-base leading-8 mb-6">
                Sasa Saleh is a media graduate from <span style={{ color: '#FFD700' }}>Al Mashreq University</span>, combining a strong academic background in media with real-world content creation and live performance.
              </p>
              <p className="text-gray-300 text-base leading-8 mb-8">
                He has built a powerful presence through comedy, acting, and engaging storytelling — connecting with audiences through <span style={{ color: '#FFD700' }}>authentic and entertaining content</span> that resonates across cultures and borders.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Years Active', value: '2+' },
                  { label: 'Pieces of Content', value: '260+' },
                  { label: 'Based in', value: 'Dubai, UAE' },
                  { label: 'Languages', value: 'Arabic · English' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-4" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.12)' }}>
                    <p className="text-xs tracking-widest uppercase mb-1" style={{ color: '#B8860B' }}>{item.label}</p>
                    <p className="font-bold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="reveal-hidden-right flex flex-col gap-6">
            {[
              { icon: '🎭', title: 'Stand-Up Comedy', desc: 'Crafting razor-sharp observational humor that resonates with Arab audiences worldwide.' },
              { icon: '🎬', title: 'Acting & Sketches', desc: 'Bringing characters to life with natural charisma and comedic timing in short-form video.' },
              { icon: '📱', title: 'Viral Content', desc: 'Consistently hitting millions of views with relatable, shareable, and highly engaging posts.' },
              { icon: '🌍', title: 'Pan-Arab Reach', desc: 'Audience spanning UAE, Egypt, Iraq, Syria and beyond — a true regional presence.' },
            ].map((item, i) => (
              <div key={i} className="glass-card shimmer-card rounded-2xl p-5 flex gap-5 items-start hover:scale-[1.02] transition-transform duration-300 group"
                style={{ borderColor: 'rgba(184,134,11,0.15)', transitionDelay: `${i * 0.1}s` }}>
                <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.15)' }}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1 group-hover:text-gold-gradient transition-all" style={{ color: '#F5F5F5' }}>{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Insight Card (standalone to avoid hook-in-map) ─────────── */
function InsightCard({ label, value, suffix, icon, desc, started, delay }) {
  const fmt = (n) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : (n / 1000).toFixed(0) + 'K'
  const count = useCountUp(value, 2500, started)
  return (
    <div className="glass-card shimmer-card rounded-2xl p-8 reveal-hidden" style={{ transitionDelay: `${delay}s` }}>
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#B8860B' }}>{label}</p>
          <p className="text-5xl font-black text-gold-gradient mb-1 stat-number" style={{ fontFamily: 'Cinzel, serif' }}>
            {started ? fmt(count) : '0'}{suffix}
          </p>
          <p className="text-gray-500 text-xs">{desc}</p>
        </div>
      </div>
      <div className="mt-6 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-[2500ms]"
          style={{ width: started ? '100%' : '0%', background: 'linear-gradient(90deg, #B8860B, #FFD700)' }} />
      </div>
    </div>
  )
}

/* ─── Stats Section ──────────────────────────────────────────── */
function StatsSection() {
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect() }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="stats" className="relative py-28 px-6" ref={ref}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[600px]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(184,134,11,0.07) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto">
        <SectionTitle label="Social Media" title="My Reach" sub="Real numbers, real engagement" />

        {/* Social followers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '📸', platform: 'Instagram', value: 147000, color: '#E1306C' },
            { icon: '🎵', platform: 'TikTok', value: 23000, color: '#69C9D0' },
            { icon: '👥', platform: 'Facebook', value: 30000, color: '#1877F2' },
          ].map((s, i) => (
            <div key={i} className="reveal-hidden" style={{ transitionDelay: `${i * 0.15}s` }}>
              <StatCard {...s} started={started} />
            </div>
          ))}
        </div>

        {/* Performance insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <InsightCard label="Views (Last 30 Days)" value={14100000} suffix="+" icon="👁️" desc="Total video views in the past month" started={started} delay={0} />
          <InsightCard label="Total Interactions" value={582000} suffix="+" icon="💫" desc="Likes, comments, shares & saves" started={started} delay={0.2} />
        </div>

        {/* Analytics circle */}
        <AnalyticsCircle started={started} />
      </div>
    </section>
  )
}

function AnalyticsCircle({ started }) {
  const radius = 80
  const circ = 2 * Math.PI * radius
  const [dash, setDash] = useState(circ)
  const viewsCount = useCountUp(14118725, 2800, started)
  const reachCount = useCountUp(4312265, 2800, started)

  useEffect(() => {
    if (started) {
      setTimeout(() => setDash(circ * 0.012), 100) // 1.2% followers shown
    }
  }, [started, circ])

  const fmt = (n) => n >= 1000000 ? (n / 1000000).toFixed(2) + 'M' : n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n

  return (
    <div className="glass-card shimmer-card rounded-3xl p-10 reveal-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Circle chart */}
        <div className="flex flex-col items-center gap-6">
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#B8860B' }}>Views Breakdown</p>
          <div className="relative">
            <svg width="220" height="220" viewBox="0 0 220 220">
              {/* Background ring */}
              <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="16" />
              {/* Non-followers (98.8%) */}
              <circle cx="110" cy="110" r={radius} fill="none"
                stroke="url(#goldGrad)" strokeWidth="16"
                strokeDasharray={circ}
                strokeDashoffset={started ? circ * 0.012 : circ}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 2.5s ease', transform: 'rotate(-90deg)', transformOrigin: '110px 110px' }}
              />
              {/* Followers (1.2%) small arc */}
              <circle cx="110" cy="110" r={radius} fill="none"
                stroke="rgba(255,100,150,0.7)" strokeWidth="16"
                strokeDasharray={`${circ * 0.012} ${circ}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '110px 110px' }}
              />
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B8860B" />
                  <stop offset="100%" stopColor="#FFD700" />
                </linearGradient>
              </defs>
              {/* Center text */}
              <text x="110" y="102" textAnchor="middle" fill="#FFD700" fontSize="14" fontWeight="bold" fontFamily="Cinzel,serif">
                {started ? fmt(viewsCount) : '0'}
              </text>
              <text x="110" y="122" textAnchor="middle" fill="#9CA3AF" fontSize="10">
                Total Views
              </text>
            </svg>
          </div>
          <div className="flex gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,100,150,0.7)' }} />
              <span className="text-gray-400">Followers <span style={{ color: '#FFD700' }}>1.2%</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg,#B8860B,#FFD700)' }} />
              <span className="text-gray-400">Non-followers <span style={{ color: '#FFD700' }}>98.8%</span></span>
            </div>
          </div>
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total Views', value: started ? fmt(viewsCount) : '0', suffix: '' },
            { label: 'Accounts Reached', value: started ? fmt(reachCount) : '0', suffix: '' },
            { label: 'Follower Views', value: '1.2', suffix: '%' },
            { label: 'Viral Reach', value: '98.8', suffix: '%' },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl p-5 text-center shimmer-card"
              style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.1)' }}>
              <p className="text-2xl font-black mb-1 stat-number" style={{ fontFamily: 'Cinzel, serif', color: '#FFD700' }}>
                {item.value}{item.suffix}
              </p>
              <p className="text-xs text-gray-500 tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Instagram Section ──────────────────────────────────────── */
function InstagramSection() {
  return (
    <section className="relative py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle label="Social Proof" title="Instagram Profile" sub="@sasa_saleh90 · 147K+ followers" />

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Instagram profile card */}
          <div className="flex-1 reveal-hidden-left">
            <TiltCard>
              <div className="glass-card shimmer-card rounded-3xl overflow-hidden"
                style={{
                  border: '1px solid rgba(255,215,0,0.25)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(184,134,11,0.15)',
                  maxWidth: '380px',
                  margin: '0 auto',
                }}>
                <img
                  src="/images/instagram-profile.jpeg"
                  alt="Instagram Profile"
                  className="w-full h-auto"
                />
              </div>
            </TiltCard>
          </div>

          {/* Insight screenshots */}
          <div className="flex-[2]">
            <p className="text-xs font-bold tracking-widest uppercase mb-6 reveal-hidden" style={{ color: '#B8860B' }}>
              Analytics Insights · Mar 4 – Apr 2
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { src: '/images/insight-1.jpeg', label: 'Views Breakdown' },
                { src: '/images/insight-2.jpeg', label: 'Top Content' },
                { src: '/images/insight-3.jpeg', label: 'Professional Dashboard' },
              ].map((img, i) => (
                <div key={i} className="reveal-hidden" style={{ transitionDelay: `${i * 0.15}s` }}>
                  <TiltCard className="group">
                    <div className="glass-card shimmer-card rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-2"
                      style={{
                        border: '1px solid rgba(255,215,0,0.18)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.4), 0 0 20px rgba(184,134,11,0.1)',
                      }}>
                      <img src={img.src} alt={img.label} className="w-full h-auto" />
                      <div className="p-3">
                        <p className="text-xs text-center font-semibold tracking-wider" style={{ color: '#DAA520' }}>{img.label}</p>
                      </div>
                    </div>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Content Section ────────────────────────────────────────── */
function ContentSection() {
  const types = [
    { icon: '🎤', title: 'Stand-Up Comedy', desc: 'Sharp observational comedy that captures the everyday Arab experience with wit and authenticity.' },
    { icon: '🎬', title: 'Acting Sketches', desc: 'High-energy short-form acting content that blends storytelling with comedic performance.' },
    { icon: '📱', title: 'Social Entertainment', desc: 'Platform-native content designed to perform on Instagram Reels, TikTok, and Facebook.' },
    { icon: '😂', title: 'Relatable Comedy', desc: 'Lifestyle and situational humor that audiences across the Arab world instantly connect with.' },
    { icon: '⚡', title: 'Viral Short-Form', desc: 'Optimized for virality — short, punchy, and highly shareable across all platforms.' },
  ]

  return (
    <section id="content" className="relative py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle label="Creative Work" title="Content Style" sub="Entertainment with purpose and personality" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((item, i) => (
            <div key={i} className={`glass-card shimmer-card rounded-2xl p-7 hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 group reveal-hidden ${i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              style={{
                border: '1px solid rgba(255,215,0,0.12)',
                transitionDelay: `${i * 0.1}s`,
              }}>
              <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
              <h3 className="text-lg font-bold mb-3 group-hover:text-gold-gradient" style={{ color: '#F5F5F5', fontFamily: 'Cinzel, serif' }}>
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              <div className="mt-5 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                style={{ background: 'linear-gradient(90deg, #B8860B, #FFD700)' }} />
            </div>
          ))}
        </div>

        {/* Audience reach bar */}
        <div className="mt-16 glass-card shimmer-card rounded-3xl p-10 reveal-hidden"
          style={{ border: '1px solid rgba(255,215,0,0.15)' }}>
          <p className="text-xs font-bold tracking-widest uppercase mb-8 text-center" style={{ color: '#B8860B' }}>Top Audience Countries</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { country: 'UAE', pct: 14.2 },
              { country: 'Egypt', pct: 12.6 },
              { country: 'Iraq', pct: 12.1 },
              { country: 'Syria', pct: 10.1 },
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-semibold">{item.country}</span>
                  <span style={{ color: '#FFD700' }}>{item.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="h-full rounded-full transition-all duration-[1500ms]"
                    style={{
                      width: `${item.pct * 7}%`,
                      background: 'linear-gradient(90deg, #B8860B, #FFD700)',
                    }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Services Section ───────────────────────────────────────── */
function ServicesSection() {
  const services = [
    { icon: '📢', title: 'Brand Promotions', desc: 'Authentic integrations that reach millions of engaged viewers across platforms.' },
    { icon: '🎯', title: 'Sponsored Content', desc: 'Premium branded content crafted to convert and connect with Arab audiences.' },
    { icon: '🎤', title: 'Comedy Integrations', desc: 'Your brand woven naturally into stand-up or sketch comedy for maximum recall.' },
    { icon: '🎬', title: 'Acting Collaborations', desc: 'Professional acting partnerships for films, series, and branded productions.' },
    { icon: '📱', title: 'Social Campaigns', desc: 'End-to-end social media campaign execution across Instagram, TikTok, and Facebook.' },
  ]

  return (
    <section id="services" className="relative py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionTitle label="Work With Me" title="Services" sub="Premium collaborations for your brand" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className="reveal-hidden group" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="glass-card shimmer-card rounded-2xl p-8 h-full flex flex-col gap-4 hover:-translate-y-2 transition-all duration-300 cursor-default"
                style={{ border: '1px solid rgba(255,215,0,0.12)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: 'linear-gradient(135deg, rgba(184,134,11,0.2), rgba(255,215,0,0.1))', border: '1px solid rgba(255,215,0,0.2)' }}>
                  {s.icon}
                </div>
                <h3 className="text-lg font-bold" style={{ color: '#F5F5F5', fontFamily: 'Cinzel, serif' }}>{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">{s.desc}</p>
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase group-hover:gap-4 transition-all duration-300"
                  style={{ color: '#B8860B' }}>
                  Learn More <span>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Contact Section ────────────────────────────────────────── */
function ContactSection() {
  return (
    <section id="contact" className="relative py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionTitle label="Get in Touch" title="Contact" sub="Ready to create something extraordinary together?" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Email */}
          <a href="mailto:salehmoustafa585@gmail.com" className="reveal-hidden-left group">
            <div className="glass-card shimmer-card rounded-2xl p-8 flex items-center gap-6 hover:-translate-y-2 transition-all duration-300 cursor-pointer gold-glow"
              style={{ border: '1px solid rgba(255,215,0,0.2)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform"
                style={{ background: 'linear-gradient(135deg, #B8860B, #FFD700)' }}>
                ✉️
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#B8860B' }}>Email</p>
                <p className="text-white font-semibold text-sm break-all">salehmoustafa585@gmail.com</p>
              </div>
            </div>
          </a>

          {/* WhatsApp */}
          <a href="https://wa.me/971563078787" target="_blank" rel="noopener noreferrer" className="reveal-hidden-right group">
            <div className="glass-card shimmer-card rounded-2xl p-8 flex items-center gap-6 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              style={{ border: '1px solid rgba(37,211,102,0.25)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform"
                style={{ background: 'linear-gradient(135deg, #128C7E, #25D366)' }}>
                📱
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#25D366' }}>WhatsApp / Phone</p>
                <p className="text-white font-semibold">+971 56 307 8787</p>
              </div>
            </div>
          </a>
        </div>

        {/* Social links */}
        <div className="reveal-hidden">
          <p className="text-xs font-bold tracking-widest uppercase mb-6 text-center" style={{ color: '#B8860B' }}>Follow Me</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { name: 'Instagram', icon: '📸', handle: '@sasa_saleh90', url: 'https://www.instagram.com/sasa_saleh90?igsh=MXZyZ3Q5YmVhdnVy', color: '#E1306C' },
              { name: 'TikTok', icon: '🎵', handle: '@sasasaleh1990', url: 'https://www.tiktok.com/@sasasaleh1990?_r=1&_t=ZS-95EKVXjWRkL', color: '#69C9D0' },
              { name: 'Facebook', icon: '👥', handle: 'Sasa Saleh', url: 'https://www.facebook.com/share/17Q37VXmBa/?mibextid=wwXIfr', color: '#1877F2' },
            ].map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                className="glass-card shimmer-card rounded-2xl px-6 py-4 flex items-center gap-4 hover:scale-105 hover:-translate-y-1 transition-all duration-300 group"
                style={{ border: `1px solid ${s.color}30` }}>
                <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{s.icon}</span>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase" style={{ color: s.color }}>{s.name}</p>
                  <p className="text-gray-300 text-sm font-semibold">{s.handle}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ─────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="py-12 px-6 border-t" style={{ borderColor: 'rgba(255,215,0,0.08)' }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-2xl font-black text-gold-gradient" style={{ fontFamily: 'Cinzel, serif' }}>SASA SALEH</p>
        <p className="text-gray-500 text-xs text-center">Actor · Stand-Up Comedian · Content Creator · Dubai, UAE</p>
        <p className="text-gray-600 text-xs">© 2024 Sasa Saleh. All rights reserved.</p>
      </div>
    </footer>
  )
}

/* ─── App ─────────────────────────────────────────────────────── */
export default function App() {
  useReveal()

  return (
    <div className="relative min-h-screen bg-cinema" style={{ cursor: 'none' }}>
      <CustomCursor />
      <Particles count={50} />
      <Navbar />
      <HeroSection />
      <AboutSection />
      <StatsSection />
      <InstagramSection />
      <ContentSection />
      <ServicesSection />
      <ContactSection />
      <Footer />
    </div>
  )
}
