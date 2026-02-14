import React, { useCallback, useEffect, useRef, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
const DEFAULT_LIMIT = 10

export default function App() {
  const [items, setItems] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token') || '')
  const [authUser, setAuthUser] = useState('')
  const [authPass, setAuthPass] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const [error, setError] = useState('')
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const [pendingLoad, setPendingLoad] = useState(false)
  const [loadedIds, setLoadedIds] = useState(() => new Set())
  const [reloadToken, setReloadToken] = useState(0)
  const userScrolledRef = useRef(false)
  const bottomLockRef = useRef(false)
  const lastReloadRef = useRef(-1)
  const tokenRef = useRef(authToken)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    const token = tokenRef.current
    if (!token) return
    setLoading(true)
    setError('')

    const params = new URLSearchParams()
    params.set('limit', String(limit))
    if (cursor) params.set('cursor', String(cursor))
    if (selectedKeyword) params.set('keyword', selectedKeyword)

    try {
      const res = await fetch(`${API_BASE}/api/images/?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (res.status === 401) {
        localStorage.removeItem('token')
        setAuthToken('')
        tokenRef.current = ''
        throw new Error('Session expired. Please login again.')
      }
      if (!res.ok) throw new Error('Failed to load images')
      const data = await res.json()
      setItems(prev => {
        const map = new Map(prev.map(item => [item.id, item]))
        for (const item of data.items) {
          map.set(item.id, item)
        }
        return Array.from(map.values())
      })
      setCursor(data.next_cursor)
      setHasMore(Boolean(data.next_cursor))
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [cursor, hasMore, loading, selectedKeyword, limit])

  useEffect(() => {
    setItems([])
    setCursor(null)
    setHasMore(true)
    setPendingLoad(false)
    setError('')
    setLoadedIds(new Set())
    userScrolledRef.current = false
    bottomLockRef.current = false
    setReloadToken(token => token + 1)
  }, [selectedKeyword, limit, authToken])

  useEffect(() => {
    if (lastReloadRef.current === reloadToken) return
    lastReloadRef.current = reloadToken
    loadMore()
  }, [reloadToken, loadMore])

  useEffect(() => {
    if (!authToken) return
    if (items.length > 0 || loading) return
    loadMore()
  }, [authToken, items.length, loading, loadMore])

  useEffect(() => {
    tokenRef.current = authToken
  }, [authToken])

  const handleLogin = async event => {
    event.preventDefault()
    if (authLoading) return
    setAuthLoading(true)
    setError('')

    try {
      const endpoint = isRegister ? 'register' : 'login'
      const res = await fetch(`${API_BASE}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUser, password: authPass })
      })

      if (!res.ok) {
        throw new Error(isRegister ? 'Register failed' : 'Invalid username or password')
      }
      const data = await res.json()
      localStorage.setItem('token', data.token)
      tokenRef.current = data.token
      setAuthToken(data.token)
      setAuthPass('')
      setAuthUser('')
      setIsRegister(false)
      setItems([])
      setCursor(null)
      setHasMore(true)
      setPendingLoad(false)
      setLoadedIds(new Set())
      userScrolledRef.current = false
      bottomLockRef.current = false
      setReloadToken(token => token + 1)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setAuthToken('')
    setItems([])
    setCursor(null)
    setHasMore(true)
    setPendingLoad(false)
    setError('')
  }

  useEffect(() => {
    if (!pendingLoad) return
    if (!userScrolledRef.current) return
    loadMore()
    setPendingLoad(false)
  }, [pendingLoad, loadMore])

  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      console.log('[scroll] listener running')
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        const scrollPos = window.scrollY + window.innerHeight
        const bottom = document.documentElement.scrollHeight
        const atBottom = scrollPos >= bottom - 10

        if (window.scrollY > 0) {
          userScrolledRef.current = true
        }

        if (scrollPos < bottom - 200) {
          bottomLockRef.current = false
        }

        if (atBottom && userScrolledRef.current && !bottomLockRef.current) {
          bottomLockRef.current = true
          console.log('[scroll] bottom reached, request next batch')
          setPendingLoad(true)
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [loadMore])

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">Full-Stack Developer Test For Yutthachai T.</p>
          <h1>Dynamic Keyword Gallery</h1>
          <p className="subtitle">Infinite scroll, random sizes, click-to-filter hashtags.</p>
        </div>
        <div className="filter">
          <span className="label">Filter:</span>
          {selectedKeyword ? (
            <button className="pill active" onClick={() => setSelectedKeyword('')}>
              #{selectedKeyword} (clear)
            </button>
          ) : (
            <span className="pill muted">None</span>
          )}
        </div>
        <div className="filter">
          {authToken ? (
            <button className="pill" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <form className="login" onSubmit={handleLogin}>
              <input
                className="input"
                type="text"
                placeholder="username"
                value={authUser}
                onChange={event => setAuthUser(event.target.value)}
                required
              />
              <input
                className="input"
                type="password"
                placeholder="password"
                value={authPass}
                onChange={event => setAuthPass(event.target.value)}
                required
              />
              <button className="pill active" type="submit" disabled={authLoading}>
                {authLoading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
              </button>
              <button
                className="pill"
                type="button"
                onClick={() => setIsRegister(value => !value)}
              >
                {isRegister ? 'Have account' : 'Create account'}
              </button>
            </form>
          )}
        </div>
        <div className="filter">
          <span className="label">Limit:</span>
          <select
            className="select"
            value={limit}
            onChange={event => setLimit(Number(event.target.value))}
          >
            {[10, 12, 15, 20, 30].map(value => (
              <option key={value} value={value}>
                {value} / batch
              </option>
            ))}
          </select>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <section className="masonry" aria-live="polite">
        {items.map(item => (
          <article key={item.id} className="card">
            <div className="image-wrap" style={{ aspectRatio: `${item.width} / ${item.height}` }}>
              <img
                className={loadedIds.has(item.id) ? 'loaded' : ''}
                src={item.url}
                alt={`Placeholder ${item.id}`}
                loading="lazy"
                onLoad={() => {
                  setLoadedIds(prev => {
                    const next = new Set(prev)
                    next.add(item.id)
                    return next
                  })
                }}
              />
            </div>
            <div className="tags">
              {item.keywords.map(tag => (
                <button
                  key={`${item.id}-${tag}`}
                  className={`tag ${selectedKeyword === tag ? 'active' : ''}`}
                  onClick={() => setSelectedKeyword(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>

      <div className="sentinel">
        {!hasMore && !loading && <span>No more items.</span>}
      </div>
      {loading && (
        <div className="toast">
          <span className="spinner" aria-hidden="true" />
          <span>กำลังโหลดภาพ</span>
        </div>
      )}
    </div>
  )
}
