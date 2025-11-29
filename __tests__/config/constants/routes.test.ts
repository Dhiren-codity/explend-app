import { describe, it, expect, vi, afterEach } from 'vitest'
import { DISABLED_ROUTES } from '../../../config/constants/routes'

afterEach(() => {
  vi.clearAllMocks()
  // Reset mutations to avoid cross-test interference
  DISABLED_ROUTES.length = 0
})

describe('config/constants/routes - DISABLED_ROUTES', () => {
  it('exports DISABLED_ROUTES as an array', () => {
    expect(DISABLED_ROUTES).toBeDefined()
    expect(Array.isArray(DISABLED_ROUTES)).toBe(true)
  })

  it('is initially empty', () => {
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(DISABLED_ROUTES).toStrictEqual([])
  })

  it('is mutable: push adds items', () => {
    ;(DISABLED_ROUTES as unknown as string[]).push('/one')
    ;(DISABLED_ROUTES as unknown as string[]).push('/two')
    expect(DISABLED_ROUTES.length).toBe(2)
    expect((DISABLED_ROUTES as unknown as string[]).includes('/one')).toBe(true)
    expect((DISABLED_ROUTES as unknown as string[]).includes('/two')).toBe(true)
  })

  it('can be cleared by setting length to 0', () => {
    ;(DISABLED_ROUTES as unknown as string[]).push('/a', '/b', '/c')
    expect(DISABLED_ROUTES.length).toBe(3)
    DISABLED_ROUTES.length = 0
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(DISABLED_ROUTES).toStrictEqual([])
  })

  it('mutations persist across dynamic imports (module cache)', async () => {
    ;(DISABLED_ROUTES as unknown as string[]).push('/persisted')
    const mod = await import('../../../config/constants/routes')
    expect(mod.DISABLED_ROUTES).toBe(DISABLED_ROUTES)
    expect((mod.DISABLED_ROUTES as unknown as string[]).includes('/persisted')).toBe(true)
  })

  it('same reference across multiple dynamic imports', async () => {
    const mod1 = await import('../../../config/constants/routes')
    const mod2 = await import('../../../config/constants/routes')
    expect(mod1.DISABLED_ROUTES).toBe(mod2.DISABLED_ROUTES)
    expect(mod1.DISABLED_ROUTES).toBe(DISABLED_ROUTES)
  })

  it('allows any string value at runtime (no validation)', () => {
    ;(DISABLED_ROUTES as unknown as string[]).push('not-a-route')
    expect((DISABLED_ROUTES as unknown as string[]).includes('not-a-route')).toBe(true)
  })

  it('is not frozen or sealed and is extensible', () => {
    expect(Object.isFrozen(DISABLED_ROUTES)).toBe(false)
    expect(Object.isSealed(DISABLED_ROUTES)).toBe(false)
    expect(Object.isExtensible(DISABLED_ROUTES)).toBe(true)
  })

  it('supports splice operations like a normal array', () => {
    ;(DISABLED_ROUTES as unknown as string[]).push('a', 'b', 'c')
    const removed = DISABLED_ROUTES.splice(1, 1)
    expect(removed).toStrictEqual(['b'])
    expect(DISABLED_ROUTES).toStrictEqual(['a', 'c'])
  })

  it('delete leaves a hole but preserves length', () => {
    ;(DISABLED_ROUTES as unknown as string[]).push('x', 'y', 'z')
    expect(DISABLED_ROUTES.length).toBe(3)
    // Delete middle element
    // @ts-expect-error - intentional runtime behavior test
    delete DISABLED_ROUTES[1]
    expect(DISABLED_ROUTES.length).toBe(3)
    expect(DISABLED_ROUTES[1]).toBeUndefined()
    expect(DISABLED_ROUTES[0]).toBe('x')
    expect(DISABLED_ROUTES[2]).toBe('z')
  })

  it('push returns new length', () => {
    const len1 = (DISABLED_ROUTES as unknown as string[]).push('/x')
    expect(len1).toBe(1)
    const len2 = (DISABLED_ROUTES as unknown as string[]).push('/y')
    expect(len2).toBe(2)
  })

  it('pop returns last element and reduces length', () => {
    ;(DISABLED_ROUTES as unknown as string[]).push('first', 'second')
    const popped = DISABLED_ROUTES.pop()
    expect(popped).toBe('second')
    expect(DISABLED_ROUTES.length).toBe(1)
    expect(DISABLED_ROUTES[0]).toBe('first')
  })

  it('iteration order is preserved', () => {
    ;(DISABLED_ROUTES as unknown as string[]).push('route1', 'route2', 'route3')
    const iterated = [...(DISABLED_ROUTES as unknown as string[])]
    expect(iterated).toStrictEqual(['route1', 'route2', 'route3'])
  })

  it('destructured reference points to the same array object', () => {
    const ref = DISABLED_ROUTES
    ;(ref as unknown as string[]).push('shared')
    expect(DISABLED_ROUTES.length).toBe(1)
    expect((DISABLED_ROUTES as unknown as string[]).includes('shared')).toBe(true)
    expect(ref).toBe(DISABLED_ROUTES)
  })


  it('Array methods like includes work as expected', () => {
    ;(DISABLED_ROUTES as unknown as string[]).push('/alpha', '/beta')
    expect((DISABLED_ROUTES as unknown as string[]).includes('/alpha')).toBe(true)
    expect((DISABLED_ROUTES as unknown as string[]).includes('/gamma')).toBe(false)
  })

  it('JSON serialization reflects current contents', () => {
    ;(DISABLED_ROUTES as unknown as string[]).push('/json-test-1', '/json-test-2')
    expect(JSON.stringify(DISABLED_ROUTES)).toBe('["/json-test-1","/json-test-2"]')
  })

  it('clearing by splice(0) removes all items', () => {
    ;(DISABLED_ROUTES as unknown as string[]).push('/clear1', '/clear2', '/clear3')
    DISABLED_ROUTES.splice(0, DISABLED_ROUTES.length)
    expect(DISABLED_ROUTES.length).toBe(0)
    expect(DISABLED_ROUTES).toStrictEqual([])
  })
})
