import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DISABLED_ROUTES } from '../../../config/constants/routes'

describe('config/constants/routes', () => {
  beforeEach(() => {
    DISABLED_ROUTES.length = 0
  })

  afterEach(() => {
    vi.clearAllMocks()
    DISABLED_ROUTES.length = 0
  })

  it('exports DISABLED_ROUTES and not ROUTE at runtime', async () => {
    const mod = await import('../../../config/constants/routes')
    expect('DISABLED_ROUTES' in mod).toBe(true)
    expect('ROUTE' in mod).toBe(false)
    expect((mod as any).ROUTE).toBeUndefined()
  })

  it('DISABLED_ROUTES is an array', () => {
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true)
  })

  it('DISABLED_ROUTES is initially empty', () => {
    expect(DISABLED_ROUTES.length).toBe(0)
  })

  it('can push a route string', () => {
    const route = '/' as unknown as never
    DISABLED_ROUTES.push(route as any)
    expect(DISABLED_ROUTES.length).toBe(1)
    expect(DISABLED_ROUTES[0]).toBe('/')
  })

  it('preserves insertion order when pushing multiple items', () => {
    const first = '/sign-in' as any
    const second = '/export' as any
    DISABLED_ROUTES.push(first, second)
    expect(DISABLED_ROUTES).toEqual(['/sign-in', '/export'])
  })

  it('allows duplicate entries', () => {
    const value = '/chart' as any
    DISABLED_ROUTES.push(value, value, value)
    expect(DISABLED_ROUTES.length).toBe(3)
    expect(DISABLED_ROUTES).toEqual(['/chart', '/chart', '/chart'])
  })

  it('pop removes and returns the last element', () => {
    const items = ['/limits', '/categories', '/settings'] as any
    DISABLED_ROUTES.push(...items)
    const popped = DISABLED_ROUTES.pop()
    expect(popped).toBe('/settings')
    expect(DISABLED_ROUTES).toEqual(['/limits', '/categories'])
  })

  it('unshift adds to the beginning and shift removes from the beginning', () => {
    DISABLED_ROUTES.push('/feedback' as any)
    const lenAfterUnshift = DISABLED_ROUTES.unshift('/issue' as any)
    expect(lenAfterUnshift).toBe(2)
    expect(DISABLED_ROUTES[0]).toBe('/issue')
    const shifted = DISABLED_ROUTES.shift()
    expect(shifted).toBe('/issue')
    expect(DISABLED_ROUTES).toEqual(['/feedback'])
  })

  it('splice can remove elements', () => {
    DISABLED_ROUTES.push('/a' as any, '/b' as any, '/c' as any)
    const removed = DISABLED_ROUTES.splice(1, 1)
    expect(removed).toEqual(['/b'])
    expect(DISABLED_ROUTES).toEqual(['/a', '/c'])
  })

  it('splice can insert elements', () => {
    DISABLED_ROUTES.push('/a' as any, '/c' as any)
    DISABLED_ROUTES.splice(1, 0, '/b' as any)
    expect(DISABLED_ROUTES).toEqual(['/a', '/b', '/c'])
  })

  it('setting length to 0 clears the array', () => {
    DISABLED_ROUTES.push('/one' as any, '/two' as any)
    DISABLED_ROUTES.length = 0
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(DISABLED_ROUTES).toEqual([])
  })

  it('dynamic import sees the same reference and mutations', async () => {
    const modBefore = await import('../../../config/constants/routes')
    expect(modBefore.DISABLED_ROUTES).toBe(DISABLED_ROUTES)
    DISABLED_ROUTES.push('/sitemap.xml' as any)
    const modAfter = await import('../../../config/constants/routes')
    expect(modAfter.DISABLED_ROUTES).toBe(DISABLED_ROUTES)
    expect(modAfter.DISABLED_ROUTES.includes('/sitemap.xml')).toBe(true)
  })

  it('array is extensible, not sealed, and not frozen', () => {
    expect(Object.isExtensible(DISABLED_ROUTES)).toBe(true)
    expect(Object.isSealed(DISABLED_ROUTES)).toBe(false)
    expect(Object.isFrozen(DISABLED_ROUTES)).toBe(false)
  })

  it('can reassign elements by index', () => {
    DISABLED_ROUTES.push('/old' as any)
    DISABLED_ROUTES[0] = '/new' as any
    expect(DISABLED_ROUTES[0]).toBe('/new')
    expect(DISABLED_ROUTES.length).toBe(1)
  })

  it('fill modifies the array elements', () => {
    DISABLED_ROUTES.push('/1' as any, '/2' as any, '/3' as any)
    DISABLED_ROUTES.fill('/x' as any, 0, 2)
    expect(DISABLED_ROUTES).toEqual(['/x', '/x', '/3'])
  })

  it('includes returns true for existing values', () => {
    DISABLED_ROUTES.push('/exists' as any)
    expect(DISABLED_ROUTES.includes('/exists')).toBe(true)
    expect(DISABLED_ROUTES.includes('/not-exists')).toBe(false)
  })

  it('forEach iterates over all elements in order', () => {
    const calls: string[] = []
    DISABLED_ROUTES.push('/a' as any, '/b' as any, '/c' as any)
    DISABLED_ROUTES.forEach((v) => calls.push(v as any))
    expect(calls).toEqual(['/a', '/b', '/c'])
  })

  it('map creates a new array without mutating DISABLED_ROUTES', () => {
    DISABLED_ROUTES.push('/a' as any, '/b' as any)
    const mapped = DISABLED_ROUTES.map((v) => `${v}-mapped`)
    expect(mapped).toEqual(['/a-mapped', '/b-mapped'])
    expect(DISABLED_ROUTES).toEqual(['/a', '/b'])
  })

  it('join concatenates entries with comma by default', () => {
    DISABLED_ROUTES.push('/a' as any, '/b' as any)
    expect(DISABLED_ROUTES.join()).toBe('/a,/b')
  })
})
