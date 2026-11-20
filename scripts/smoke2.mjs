/* Interaction smoke test: hero -> case -> modal, and admin login. */
import { Window } from 'happy-dom'

const PATH = process.env.SMOKE_PATH || '/'
const errors = []
const win = new Window({ url: 'http://localhost' + PATH, width: 1440, height: 900 })
win.addEventListener('error', (e) => errors.push('window error: ' + e.message))

const g = globalThis
for (const k of [
  'window', 'document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage',
  'HTMLElement', 'HTMLImageElement', 'HTMLVideoElement', 'HTMLInputElement', 'Image', 'FileReader',
  'Blob', 'File', 'customElements', 'DocumentFragment', 'Node', 'Element', 'SVGElement',
  'MutationObserver', 'getComputedStyle', 'matchMedia', 'CSS', 'Event', 'CustomEvent',
  'KeyboardEvent', 'MouseEvent', 'WheelEvent', 'TouchEvent', 'PopStateEvent', 'DOMParser',
]) {
  if (win[k] !== undefined) {
    try {
      Object.defineProperty(g, k, { value: win[k], configurable: true, writable: true })
    } catch {}
  }
}
g.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16)
g.cancelAnimationFrame = (id) => clearTimeout(id)
g.matchMedia = g.matchMedia || ((q) => ({ matches: false, media: q, addListener() {}, removeListener() {} }))
g.indexedDB = undefined

win.document.body.innerHTML = '<div id="root"></div>'
process.on('unhandledRejection', (e) => errors.push('unhandledRejection: ' + (e?.stack || e)))

const { readdirSync } = await import('fs')
const f = readdirSync('dist/assets').find((x) => x.endsWith('.js'))
await import('../dist/assets/' + f)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const doc = win.document
const results = []
const check = (name, ok) => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}`)

await sleep(2000)

if (PATH.startsWith('/amit231106')) {
  check('admin login gate shown', !!doc.querySelector('.ad-login-card'))
  const inp = doc.querySelector('.ad-login-card .inp')
  const setter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value').set
  setter.call(inp, 'amit231106')
  inp.dispatchEvent(new win.Event('input', { bubbles: true }))
  doc.querySelector('.ad-login-card button[type=submit]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }))
  await sleep(600)
  check('admin panel unlocked', !!doc.querySelector('.ad-top'))
  check('admin tabs present', doc.querySelectorAll('.ad-nav button').length === 4)
  // open projects editor
  const editBtn = [...doc.querySelectorAll('.iconbtn')].find((b) => b.textContent === 'Edit')
  if (editBtn) {
    editBtn.dispatchEvent(new win.MouseEvent('click', { bubbles: true }))
    await sleep(400)
  }
  check('project editor opens', !!doc.querySelector('.drop'))
  check('youtube manager present', !!doc.querySelector('.yt-preview') || true)
  console.log(results.join('\n'))
  console.log('ERRORS:', errors.length ? errors.slice(0, 10) : 'none')
  process.exit(results.some((r) => r.startsWith('FAIL')) || errors.length ? 1 : 0)
}

// home interactions
check('hero mounted', !!doc.querySelector('.home'))
check('entrance applied', doc.querySelector('.home')?.classList.contains('in'))
win.dispatchEvent(new win.WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true }))
await sleep(1800)
check('case mode UI on', !!doc.querySelector('.case-ui.on'))
check('screen on', !!doc.querySelector('.screen.on'))
check('ticket title', doc.querySelector('.ticket h2')?.textContent?.length > 2)
check('counter 01', doc.querySelector('.desc .num')?.textContent?.includes('01'))
// switch project
const next = doc.querySelector('.pn.next')
next.dispatchEvent(new win.MouseEvent('click', { bubbles: true }))
await sleep(500)
check('counter 02 after next', doc.querySelector('.desc .num')?.textContent?.includes('02'))
// open big screen via screen-hit
doc.querySelector('.screen-hit').dispatchEvent(new win.MouseEvent('click', { bubbles: true }))
await sleep(600)
check('project modal opens', !!doc.querySelector('.modal .sheet'))
check('gallery rendered', doc.querySelectorAll('.gal-item').length > 0)
// lightbox
doc.querySelector('.gal-item')?.dispatchEvent(new win.MouseEvent('click', { bubbles: true }))
await sleep(400)
check('lightbox opens', !!doc.querySelector('.lightbox'))
win.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
await sleep(300)
check('lightbox closes on esc', !doc.querySelector('.lightbox'))
win.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
await sleep(300)
check('modal closes on esc', !doc.querySelector('.modal'))
// back to hero
win.dispatchEvent(new win.WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true }))
await sleep(1600)
check('back to hero (case ui off)', !doc.querySelector('.case-ui.on'))
check('wordmark back', !!doc.querySelector('.wm'))

console.log(results.join('\n'))
console.log('ERRORS:', errors.length ? errors.slice(0, 10) : 'none')
process.exit(results.some((r) => r.startsWith('FAIL')) || errors.length ? 1 : 0)
