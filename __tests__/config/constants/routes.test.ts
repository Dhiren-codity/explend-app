import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
})

describe('DISABLED_ROUTES behavior', () => {
  it('is an array', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true)
  })

  it('is initially empty', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(DISABLED_ROUTES).toEqual([])
  })

  it('is the same reference across imports without reset', async () => {
    const mod1 = await import('../../../config/constants/routes')
    const mod2 = await import('../../../config/constants/routes')
    expect(mod2.DISABLED_ROUTES).toBe(mod1.DISABLED_ROUTES)
  })

  it('mutations persist across references', async () => {
    const mod1 = await import('../../../config/constants/routes')
    const mod2 = await import('../../../config/constants/routes')

    const arr1 = mod1.DISABLED_ROUTES
    const arr2 = mod2.DISABLED_ROUTES

    const beforeLen = arr1.length
    const pushedValue = '/disabled-route'
    const newLen = arr1.push(pushedValue)

    expect(newLen).toBe(beforeLen + 1)
    expect(arr1.includes(pushedValue)).toBe(true)
    expect(arr2.includes(pushedValue)).toBe(true)
    expect(arr2.length).toBe(beforeLen + 1)

    const popped = arr2.pop()
    expect(popped).toBe(pushedValue)
    expect(arr1.length).toBe(beforeLen)
  })

  it('resetting modules restores a fresh empty array and new reference', async () => {
    const mod1 = await import('../../../config/constants/routes')
    mod1.DISABLED_ROUTES.push('/disabled-route', '/sign-in')
    expect(mod1.DISABLED_ROUTES.length).toBe(2)

    vi.resetModules()

    const mod2 = await import('../../../config/constants/routes')
    expect(mod2.DISABLED_ROUTES).not.toBe(mod1.DISABLED_ROUTES)
    expect(mod2.DISABLED_ROUTES.length).toBe(0)
    expect(mod2.DISABLED_ROUTES).toEqual([])
  })

  it('accepts string values (runtime, no type enforcement)', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/chart')
    DISABLED_ROUTES.push('/sitemap.xml')
    expect(DISABLED_ROUTES.includes('/chart')).toBe(true)
    expect(DISABLED_ROUTES.includes('/sitemap.xml')).toBe(true)
    expect(typeof DISABLED_ROUTES[0]).toBe('string')
    expect(typeof DISABLED_ROUTES[1]).toBe('string')
  })

  it('setting length to 0 clears the array', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/export', '/settings', '/feedback')
    expect(DISABLED_ROUTES.length).toBe(3)
    DISABLED_ROUTES.length = 0
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(DISABLED_ROUTES).toEqual([])
  })

  it('splice removes items correctly', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/export', '/settings', '/feedback')
    const removed = DISABLED_ROUTES.splice(1, 1)
    expect(removed).toEqual(['/settings'])
    expect(DISABLED_ROUTES).toEqual(['/export', '/feedback'])
  })

  it('array push returns correct new length', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    const lenBefore = DISABLED_ROUTES.length
    const ret = DISABLED_ROUTES.push('/issue')
    expect(ret).toBe(lenBefore + 1)
    expect(DISABLED_ROUTES[DISABLED_ROUTES.length - 1]).toBe('/issue')
  })

  it('supports index assignment to modify existing entries', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/home', '/categories')
    expect(DISABLED_ROUTES[0]).toBe('/home')
    DISABLED_ROUTES[0] = '/limits'
    expect(DISABLED_ROUTES[0]).toBe('/limits')
    expect(DISABLED_ROUTES.includes('/categories')).toBe(true)
  })

  it('includes works for present and absent values', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/monthly-report')
    expect(DISABLED_ROUTES.includes('/monthly-report')).toBe(true)
    expect(DISABLED_ROUTES.includes('/non-existent')).toBe(false)
  })

  it('map produces strings for route entries', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/feedback', '/issue', '/export')
    const types = DISABLED_ROUTES.map(v => typeof v)
    expect(types.every(t => t === 'string')).toBe(true)
  })

  it('array toString matches join with comma', async () => {
    const { DISABLED_ROUTES } = await import('../../../config/constants/routes')
    DISABLED_ROUTES.push('/feedback', '/issue')
    expect(DISABLED_ROUTES.toString()).toBe(['/feedback', '/issue'].join(','))
  })
})