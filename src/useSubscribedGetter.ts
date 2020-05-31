import { useEffect, useState } from 'react'
import isEqual from 'lodash/isEqual'
import * as localStorage from './localStorage'

type Milliseconds = number

type GenericFn = (args: any) => any

type AsyncFn<DataShape> = () => Promise<DataShape>

type UpdateFn<DataShape> = (data: DataShape) => any

type SubscriptionOptions<CacheType, DataShape> = {
  initialValue?: CacheType
  onUpdate?: UpdateFn<DataShape>
  pollInterval?: Milliseconds
}

const cacheName = (fn: GenericFn) => fn.name + ':subscription'

const noop = () => {}

async function refreshFromChain<DataShape> (
  fn: AsyncFn<DataShape>,
  onUpdate: UpdateFn<DataShape>,
  setState: UpdateFn<DataShape>
) {
  const fresh = await fn()
  const cached = localStorage.get(cacheName(fn))

  if (!isEqual(fresh, cached)) {
    localStorage.set(cacheName(fn), fresh)
    onUpdate(fresh)
    setState(fresh)
  }
}

export default function useSubscription<CacheType, DataShape> (
  fn: AsyncFn<DataShape>,
  {
    initialValue,
    onUpdate = noop,
    pollInterval = 5000
  }: SubscriptionOptions<CacheType, DataShape> = {}
) {
  const [state, setState] = useState(
    localStorage.get(cacheName(fn)) || initialValue
  )

  useEffect(() => {
    refreshFromChain(fn, onUpdate, setState)

    const interval = setInterval(
      () => refreshFromChain(fn, onUpdate, setState),
      pollInterval
    )

    return () => clearInterval(interval)
  }, [onUpdate])

  return state
}
