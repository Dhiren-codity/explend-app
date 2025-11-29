import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

afterEach(() => {
  vi.clearAllMocks()
})

describe('DISABLED_ROUTES - fresh module each test', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('exports an array', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true)
    expect(DISABLED_ROUTES.constructor).toBe(Array)
  })

  it('is initially empty', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(JSON.stringify(DISABLED_ROUTES)).toBe('[]')
  })

  it('toString and join behave as for an empty array', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    expect(DISABLED_ROUTES.toString()).toBe('')
    expect(DISABLED_ROUTES.join(',')).toBe('')
  })

  it('does not include any route initially', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    expect(DISABLED_ROUTES.includes('/sign-in')).toBe(false)
    expect(DISABLED_ROUTES.includes('/')).toBe(false)
  })

  it('is mutable: push adds items and updates length', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/sign-in')
    expect(DISABLED_ROUTES.length).toBe(1)
    expect(DISABLED_ROUTES.includes('/sign-in')).toBe(true)
  })

  it('allows duplicate entries', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/sign-in')
    DISABLED_ROUTES.push('/sign-in')
    expect(DISABLED_ROUTES.length).toBe(2)
    expect(DISABLED_ROUTES[0]).toBe('/sign-in')
    expect(DISABLED_ROUTES[1]).toBe('/sign-in')
  })

  it('unshift adds to the beginning', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/chart')
    DISABLED_ROUTES.unshift('/limits')
    expect(DISABLED_ROUTES.length).toBe(2)
    expect(DISABLED_ROUTES[0]).toBe('/limits')
    expect(DISABLED_ROUTES[1]).toBe('/chart')
  })

  it('pop removes the last item and returns it', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/feedback')
    DISABLED_ROUTES.push('/issue')
    const popped = DISABLED_ROUTES.pop()
    expect(popped).toBe('/issue')
    expect(DISABLED_ROUTES).toEqual(['/feedback'])
  })

  it('splice removes items by index', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/export', '/settings', '/categories')
    const removed = DISABLED_ROUTES.splice(1, 1)
    expect(removed).toEqual(['/settings'])
    expect(DISABLED_ROUTES).toEqual(['/export', '/categories'])
  })

  it('assignment beyond current length expands the array and creates holes', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/home')
    DISABLED_ROUTES[2] = '/export'
    expect(DISABLED_ROUTES.length).toBe(3)
    expect(0 in DISABLED_ROUTES).toBe(true)
    expect(1 in DISABLED_ROUTES).toBe(false)
    expect(2 in DISABLED_ROUTES).toBe(true)
    expect(DISABLED_ROUTES[2]).toBe('/export')
  })

  it('length can be truncated to clear the array', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/sign-in', '/chart', '/limits')
    expect(DISABLED_ROUTES.length).toBe(3)
    DISABLED_ROUTES.length = 0
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(DISABLED_ROUTES).toEqual([])
  })
})

describe('Module export shape', () => {
  beforeEach(() => {
    vi.resetModules()
  })


describe('Module caching behavior', () => {
  it('returns the same array instance across imports without reset', async () => {
    const mod1 = await import('../../../config/constants/routes')
    const mod2 = await import('../../../config/constants/routes')
    expect(mod1.DISABLED_ROUTES).toBe(mod2.DISABLED_ROUTES)
    mod1.DISABLED_ROUTES.push('/sitemap.xml')
    expect(mod2.DISABLED_ROUTES.includes('/sitemap.xml')).toBe(true)
  })

  it('provides a fresh array after vi.resetModules()', async () => {
    const mod1 = await import('../../../config/constants/routes')
    mod1.DISABLED_ROUTES.push('/feedback')
    expect(mod1.DISABLED_ROUTES.length).toBe(1)

    vi.resetModules()
    const mod2 = await import('../../../config/constants/routes')
    expect(mod2.DISABLED_ROUTES).not.toBe(mod1.DISABLED_ROUTES)
    expect(mod2.DISABLED_ROUTES.length).toBe(0)
  })
})

describe('Array method behavior on DISABLED_ROUTES', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('map creates a new array without changing the original', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/categories', '/subscriptions')
    const mapped = DISABLED_ROUTES.map(r => r.toUpperCase())
    expect(mapped).toEqual(['/CATEGORIES', '/SUBSCRIPTIONS'])
    expect(DISABLED_ROUTES).toEqual(['/categories', '/subscriptions'])
  })

  it('filter returns subset without mutating original', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/categories', '/subscriptions', '/settings')
    const filtered = DISABLED_ROUTES.filter(r => r.startsWith('/s'))
    expect(filtered).toEqual(['/subscriptions', '/settings'])
    expect(DISABLED_ROUTES).toEqual(['/categories', '/subscriptions', '/settings'])
  })

  it('indexOf finds the correct index', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/issue', '/feedback', '/chart')
    expect(DISABLED_ROUTES.indexOf('/feedback')).toBe(1)
    expect(DISABLED_ROUTES.indexOf('/non-existent')).toBe(-1)
  })
})
