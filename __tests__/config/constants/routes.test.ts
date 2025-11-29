import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('config/constants/routes - DISABLED_ROUTES export behavior', () => {
  it('DISABLED_ROUTES is an array and initially empty', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true)
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(JSON.stringify(DISABLED_ROUTES)).toBe('[]')
  })

  it('push updates the array and length', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/a')
    expect(DISABLED_ROUTES.length).toBe(1)
    expect(DISABLED_ROUTES[0]).toBe('/a')
    expect(DISABLED_ROUTES.includes('/a')).toBe(true)
  })

  it('pop returns last element and reduces length', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/x', '/y', '/z')
    const popped = DISABLED_ROUTES.pop()
    expect(popped).toBe('/z')
    expect(DISABLED_ROUTES).toEqual(['/x', '/y'])
  })

  it('setting length to 0 empties the array', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/one', '/two')
    expect(DISABLED_ROUTES.length).toBe(2)
    DISABLED_ROUTES.length = 0
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(DISABLED_ROUTES).toEqual([])
  })

  it('accepts any value types at runtime (no runtime type enforcement)', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    const obj = { a: 1 }
    DISABLED_ROUTES.push(42 as unknown as string)
    DISABLED_ROUTES.push(obj as unknown as string)
    DISABLED_ROUTES.push(null as unknown as string)
    expect(DISABLED_ROUTES.length).toBe(3)
    expect(DISABLED_ROUTES[0]).toBe(42)
    expect(DISABLED_ROUTES[1]).toBe(obj)
    expect(DISABLED_ROUTES[2]).toBe(null)
  })

  it('multiple imports without resetting modules share the same array reference', async () => {
    const mod1 = await import('../../../config/constants/routes')
    const mod2 = await import('../../../config/constants/routes')
    expect(mod1.DISABLED_ROUTES).toBe(mod2.DISABLED_ROUTES)
    mod1.DISABLED_ROUTES.push('/shared')
    expect(mod2.DISABLED_ROUTES.includes('/shared')).toBe(true)
  })

  it('resetting modules yields a fresh array instance and empties previous mutations', async () => {
    const mod1 = await import('../../../config/constants/routes')
    mod1.DISABLED_ROUTES.push('/before-reset')
    expect(mod1.DISABLED_ROUTES.length).toBe(1)
    vi.resetModules()
    const mod2 = await import('../../../config/constants/routes')
    expect(mod2.DISABLED_ROUTES).not.toBe(mod1.DISABLED_ROUTES)
    expect(mod2.DISABLED_ROUTES.length).toBe(0)
    expect(mod2.DISABLED_ROUTES).toEqual([])
  })

  it('assigning to a high index updates length accordingly', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES[5] = '/gap'
    expect(DISABLED_ROUTES.length).toBe(6)
    expect(DISABLED_ROUTES[5]).toBe('/gap')
    expect(DISABLED_ROUTES[0]).toBe(undefined)
  })

  it('unshift and shift work as expected', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.unshift('/first')
    DISABLED_ROUTES.unshift('/zeroth')
    expect(DISABLED_ROUTES).toEqual(['/zeroth', '/first'])
    const shifted = DISABLED_ROUTES.shift()
    expect(shifted).toBe('/zeroth')
    expect(DISABLED_ROUTES).toEqual(['/first'])
  })

  it('splice removes and returns correct elements', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/a', '/b', '/c', '/d')
    const removed = DISABLED_ROUTES.splice(1, 2)
    expect(removed).toEqual(['/b', '/c'])
    expect(DISABLED_ROUTES).toEqual(['/a', '/d'])
  })

  it('map returns a new array and does not mutate original', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/a', '/b')
    const mapped = DISABLED_ROUTES.map((s) => String(s).toUpperCase())
    expect(mapped).toEqual(['/A', '/B'])
    expect(DISABLED_ROUTES).toEqual(['/a', '/b'])
  })

  it('toString and join produce expected outputs', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    expect(DISABLED_ROUTES.toString()).toBe('')
    DISABLED_ROUTES.push('/x', '/y')
    expect(DISABLED_ROUTES.toString()).toBe('/x,/y')
    expect(DISABLED_ROUTES.join('|')).toBe('/x|/y')
  })

  it('JSON.stringify reflects current array state', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/json')
    expect(JSON.stringify(DISABLED_ROUTES)).toBe('["/json"]')
    DISABLED_ROUTES.length = 0
    expect(JSON.stringify(DISABLED_ROUTES)).toBe('[]')
  })

  it('Array.prototype.includes works with object references', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    const obj = { k: 'v' }
    DISABLED_ROUTES.push(obj as unknown as string)
    expect(DISABLED_ROUTES.includes(obj as unknown as string)).toBe(true)
    expect(DISABLED_ROUTES.includes({ k: 'v' } as unknown as string)).toBe(false)
  })

  it('filter returns a new array without affecting the original', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/keep', '/remove')
    const filtered = DISABLED_ROUTES.filter((v) => v === '/keep')
    expect(filtered).toEqual(['/keep'])
    expect(DISABLED_ROUTES).toEqual(['/keep', '/remove'])
  })

  it('module export keys include DISABLED_ROUTES and exclude ROUTE', async () => {
    const mod = await import('../../../config/constants/routes')
    const keys = Object.keys(mod)
    expect(keys).toContain('DISABLED_ROUTES')
    expect(keys).not.toContain('ROUTE')
  })
})
