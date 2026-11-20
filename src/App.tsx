import React, { useEffect, useState } from 'react'
import { useStore } from './lib/store'
import Home from './home/Home'
import Admin from './admin/Admin'

function usePath(): string {
  const [path, setPath] = useState(() => window.location.pathname)
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  return path
}

function Toasts() {
  const { toasts } = useStore()
  return (
    <>
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          {t.msg}
        </div>
      ))}
    </>
  )
}

export default function App() {
  const path = usePath()
  const isAdmin = path === '/amit231106' || path.startsWith('/amit231106/')
  return (
    <>
      {isAdmin ? <Admin /> : <Home />}
      <Toasts />
    </>
  )
}
