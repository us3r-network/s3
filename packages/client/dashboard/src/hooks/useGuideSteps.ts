import { useCallback, useEffect, useRef, useState } from 'react'
import { ClientDApp } from '../types'

const GUIDE_STEPS_KEY = 'guide-steps'
const GUIDE_STEPS_DEFAULT = [false, false, false, false, false]

export type GuideStepsState = {
  steps: boolean[]
  completeStep: (stepIndex: number) => void
}
export function useGuideStepsState(
  dapps: ClientDApp[],
  loadingDApps: boolean
): GuideStepsState {
  const [steps, setSteps] = useState(GUIDE_STEPS_DEFAULT)
  const isReadStorageRef = useRef(false)

  useEffect(() => {
    try {
      const steps = localStorage.getItem(GUIDE_STEPS_KEY)
      if (steps) {
        const stepsArr = JSON.parse(steps)
        if (Array.isArray(stepsArr)) {
          setSteps(stepsArr)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      isReadStorageRef.current = true
    }
  }, [])

  useEffect(() => {
    if (!isReadStorageRef.current) return
    if (steps[0]) return
    if (loadingDApps) return
    const step1Completed = dapps?.some((item) => !!item?.models?.length)
    if (step1Completed) {
      setSteps((steps) => {
        const newSteps = [...steps]
        newSteps[0] = true
        return newSteps
      })
    }
  }, [steps, dapps, loadingDApps])

  const completeStep = useCallback((stepIndex: number) => {
    setSteps((steps) => {
      const newSteps = [...steps]
      newSteps[stepIndex] = true
      try {
        localStorage.setItem(GUIDE_STEPS_KEY, JSON.stringify(newSteps))
      } catch (error) {
        console.error(error)
      }
      return newSteps
    })
  }, [])

  return { steps, completeStep }
}
