/* Headless render smoke test: mounts the built app in happy-dom and reports errors. */
import { Window } from 'happy-dom'

const errors = []
const win = new Window({ url: 'http://localhost/', width: 1440, height: 900 })
win.addEventListener('error', (e) => errors.push('window error: ' + e.message))

// expose globals
const g = globalThis
for (const k of [
  'window', 'document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage',
  'HTMLElement', 'HTMLImageElement', 'HTMLVideoElement', 'Image', 'FileReader', 'Blob', 'File',
  'customElements', 'DocumentFragment', 'Node', 'Element', 'SVGElement', 'MutationObserver',
  'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'matchMedia', 'dispatchEvent',
  'CSS', 'Event', 'CustomEvent', 'KeyboardEvent', 'MouseEvent', 'TouchEvent', 'PopStateEvent',
  'createImageBitmap', 'crypto', 'DOMParser', 'XMLSerializer', 'Text', 'Comment',
]) {
  if (win[k] !== undefined) {
    try {
      Object.defineProperty(g, k, { value: win[k], configurable: true, writable: true })
    } catch {
      /* skip */
    }
  }
}
g.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
g.cancelAnimationFrame = (id) => clearTimeout(id)
g.matchMedia = g.matchMedia || ((q) => ({ matches: false, media: q, addListener() {}, removeListener() {} }))
g.indexedDB = undefined // not touched until an upload happens

win.document.body.innerHTML = '<div id="root"></div>'

process.on('unhandledRejection', (e) => errors.push('unhandledRejection: ' + (e?.stack || e)))

const mod = await import('../dist/assets/index.js').catch((e) => {
  // dist bundle filename is hashed; find it
  return null
})
if (!mod) {
  const { readdirSync } = await import('fs')
  const f = readdirSync('dist/assets').find((x) => x.endsWith('.js'))
  await import('../dist/assets/' + f)
}

await new Promise((r) => setTimeout(r, 2500))

const doc = win.document
const home = doc.querySelector('.home')
const admin = doc.querySelector('.ad-login')
const boot = doc.querySelector('.boot')
console.log('ROOT HTML len:', doc.body.innerHTML.length)
console.log('home:', !!home, 'class:', home ? JSON.stringify(home.className) : '-')
console.log('admin login:', !!admin)
console.log('boot still:', !!boot)
console.log('nav tags:', doc.querySelectorAll('.tag').length)
console.log('plate:', !!doc.querySelector('img.plate'))
console.log('wordmark text:', doc.querySelector('.wm text')?.textContent)
console.log('badge rows:', doc.querySelectorAll('.badge .row').length)
console.log('socialbar links:', doc.querySelectorAll('.socialbar a').length)
console.log('ERRORS:', errors.length ? errors.slice(0, 12) : 'none')
process.exit(errors.length ? 1 : 0)
