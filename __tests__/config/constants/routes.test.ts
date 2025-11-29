import { describe, it, expect, vi, afterEach } from 'vitest'

const importRoutes = async () => {
  const mod = await import('../../../config/constants/routes')
  return mod
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('config/constants/routes - DISABLED_ROUTES runtime behavior', () => {
  it('exports DISABLED_ROUTES as an array', async () => {
    vi.resetModules()
    const { DISABLED_ROUTES } = await importRoutes()
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true)
  })

  it('starts as an empty array by default', async () => {
    vi.resetModules()
    const { DISABLED_ROUTES } = await importRoutes()
    expect(DISABLED_ROUTES).toEqual([])
    expect(DISABLED_ROUTES.length).toBe(0)
  })

  it('can push a string path and reflect length and contents', async () => {
    vi.resetModules()
    const { DISABLED_ROUTES } = await importRoutes()
    ;(DISABLED_ROUTES as unknown as string[]).push('/disabled-route')
    expect(DISABLED_ROUTES.length).toBe(1)
    expect((DISABLED_ROUTES as unknown as string[])).toContain('/disabled-route')
  })

  it('can push multiple items and preserves order', async () => {
    vi.resetModules()
    const { DISABLED_ROUTES } = await importRoutes()
    const arr = DISABLED_ROUTES as unknown as string[]
    arr.push('/a')
    arr.push('/b')
    arr.push('/c')
    expect(arr).toEqual(['/a', '/b', '/c'])
  })

  it('mutations are visible across imports without resetting modules (shared reference)', async () => {
    vi.resetModules()
    const first = await importRoutes()
    const second = await importRoutes()
    expect(first.DISABLED_ROUTES).toBe(second.DISABLED_ROUTES)
    ;(first.DISABLED_ROUTES as unknown as string[]).push('/shared')
    expect((second.DISABLED_ROUTES as unknown as string[])).toContain('/shared')
  })

  it('resetModules restores a fresh, empty array', async () => {
    vi.resetModules()
    const mod1 = await importRoutes()
    ;(mod1.DISABLED_ROUTES as unknown as string[]).push('/temp')
    expect(mod1.DISABLED_ROUTES.length).toBe(1)
    vi.resetModules()
    const mod2 = await importRoutes()
    expect(mod2.DISABLED_ROUTES).toEqual([])
    expect(mod2.DISABLED_ROUTES.length).toBe(0)
  })

  it('array is not frozen and is mutable', async () => {
    vi.resetModules()
    const { DISABLED_ROUTES } = await importRoutes()
    expect(Object.isFrozen(DISABLED_ROUTES)).toBe(false)
    ;(DISABLED_ROUTES as unknown as string[]).push('/x')
    expect(DISABLED_ROUTES.length).toBe(1)
  })

  it('can clear the array by setting length to 0', async () => {
    vi.resetModules()
    const { DISABLED_ROUTES } = await importRoutes()
    const arr = DISABLED_ROUTES as unknown as string[]
    arr.push('/one', '/two')
    expect(arr.length).toBe(2)
    arr.length = 0
    expect(arr).toEqual([])
    expect(arr.length).toBe(0)
  })

  it('can remove items using pop and splice', async () => {
    vi.resetModules()
    const { DISABLED_ROUTES } = await importRoutes()
    const arr = DISABLED_ROUTES as unknown as string[]
    arr.push('/one', '/two', '/three')
    expect(arr.pop()).toBe('/three')
    expect(arr).toEqual(['/one', '/two'])
    arr.splice(0, 1)
    expect(arr).toEqual(['/two'])
  })

  it('allows duplicate entries', async () => {
    vi.resetModules()
    const { DISABLED_ROUTES } = await importRoutes()
    const arr = DISABLED_ROUTES as unknown as string[]
    arr.push('/dup', '/dup')
    expect(arr.length).toBe(2)
    expect(arr[0]).toBe('/dup')
    expect(arr[1]).toBe('/dup')
  })

  it('toString reflects joined content', async () => {
    vi.resetModules()
    const { DISABLED_ROUTES } = await importRoutes()
    const arr = DISABLED_ROUTES as unknown as string[]
    expect(arr.toString()).toBe('')
    arr.push('/a', '/b')
    expect(arr.toString()).toBe('/a,/b')
  })

  it('includes and indexOf behave as expected', async () => {
    vi.resetModules()
    const { DISABLED_ROUTES } = await importRoutes()
    const arr = DISABLED_ROUTES as unknown as string[]
    arr.push('/alpha', '/beta', '/gamma')
    expect(arr.includes('/beta')).toBe(true)
    expect(arr.includes('/delta')).toBe(false)
    expect(arr.indexOf('/alpha')).toBe(0)
    expect(arr.indexOf('/gamma')).toBe(2)
    expect(arr.indexOf('/missing')).toBe(-1)
  })

  it('slice returns a shallow copy of current contents', async () => {
    vi.resetModules()
    const { DISABLED_ROUTES } = await importRoutes()
    const arr = DISABLED_ROUTES as unknown as string[]
    arr.push('/r1', '/r2', '/r3')
    const copy = arr.slice()
    expect(copy).toEqual(['/r1', '/r2', '/r3'])
    arr.push('/r4')
    expect(copy).toEqual(['/r1', '/r2', '/r3'])
    expect(arr).toEqual(['/r1', '/r2', '/r3', '/r4'])
  })

  it('unshift and shift work as expected', async () => {
    vi.resetModules()
    const { DISABLED_ROUTES } = await importRoutes()
    const arr = DISABLED_ROUTES as unknown as string[]
    arr.push('/mid')
    arr.unshift('/start')
    expect(arr).toEqual(['/start', '/mid'])
    const shifted = arr.shift()
    expect(shifted).toBe('/start')
    expect(arr).toEqual(['/mid'])
  })

  it('does not export ROUTE as a runtime value', async () => {
    vi.resetModules()
    const mod = await importRoutes()
    expect('ROUTE' in mod).toBe(false)
    // Accessing non-existent runtime export should be undefined
    // @ts-expect-error runtime check for non-existent export
    expect(mod.ROUTE).toBeUndefined()
  })
})
