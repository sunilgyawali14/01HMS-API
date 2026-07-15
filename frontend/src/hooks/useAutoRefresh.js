import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * useAutoRefresh — polls a fetch function at a given interval.
 *
 * @param {Function} fetchFn  - the async function that loads data
 * @param {number}   interval - polling interval in ms (default 30 000 = 30 s)
 * @returns {{ lastUpdated: Date|null, isLive: boolean }}
 */
const useAutoRefresh = (fetchFn, interval = 30000) => {
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isLive, setIsLive] = useState(true)
  const timerRef = useRef(null)

  const stableFetch = useCallback(fetchFn, [])

  const tick = useCallback(async () => {
    await stableFetch()
    setLastUpdated(new Date())
  }, [stableFetch])

  useEffect(() => {
    // initial fetch already done by parent component; just record the time
    setLastUpdated(new Date())

    timerRef.current = setInterval(() => {
      tick()
    }, interval)

    return () => clearInterval(timerRef.current)
  }, [tick, interval])

  return { lastUpdated, isLive }
}

export default useAutoRefresh
