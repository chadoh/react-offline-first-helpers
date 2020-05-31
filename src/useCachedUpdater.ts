import { useCallback, useState } from 'react'
import * as localStorage from './localStorage'

type GenericFn = (args: any) => any

type AsyncFn<T> = (args: T) => Promise<any>

type CacheOptions<CacheType, FnArgShape> = {
  initialCacheValue: CacheType
  onFunctionCall: (currentCache: CacheType, args: FnArgShape) => CacheType
  onError?: (currentCache: CacheType, error: object, args: FnArgShape) => void
}

const cacheName = (fn: GenericFn) => fn.name + ':syncing'

const noop = () => {}

export default function useCachedUpdater<CacheType, FnArgShape> (
  fn: AsyncFn<FnArgShape>,
  {
    initialCacheValue,
    onFunctionCall,
    onError = noop
  }: CacheOptions<CacheType, FnArgShape>
) {
  const [state, setState] = useState(
    localStorage.get(cacheName(fn)) || initialCacheValue
  )

  const wrappedFn = useCallback(args => {
    const newState = onFunctionCall(
      localStorage.get(cacheName(fn)) || initialCacheValue,
      args
    )
    setState(newState)
    localStorage.set(cacheName(fn), newState)
    return fn(args).catch(err => onError(
      localStorage.get(cacheName(fn)) || initialCacheValue,
      err,
      args
    ))
  }, [onFunctionCall, onError])

  const setCache = useCallback(newCache => {
    setState(newCache)
    localStorage.set(cacheName(fn), newCache)
  }, [])

  return [wrappedFn, state, setCache]
}
