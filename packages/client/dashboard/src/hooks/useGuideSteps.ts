import { useCallback, useEffect, useRef, useState } from 'react'
import { ClientDApp } from '../types.d'
import { useLocation } from 'react-router-dom'

const GUIDE_STEPS_KEY = 'guide-steps'
const GUIDE_STEPS_DEFAULT = [false, false, false, false, false]

const GUIDE_STEPS_TWO_KEY = 'guide-steps-2'
const GUIDE_STEPS_TWO_DEFAULT = [false, false, false, false]

export function useGuideStepsState(dapps: ClientDApp[], loadingDApps: boolean) {
  const [steps, setSteps] = useState(GUIDE_STEPS_DEFAULT)
  const [steps2SubSteps, setSteps2SubSteps] = useState(GUIDE_STEPS_TWO_DEFAULT)
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
      const steps2SubSteps = localStorage.getItem(GUIDE_STEPS_TWO_KEY)
      if (steps2SubSteps) {
        const steps2SubStepsArr = JSON.parse(steps2SubSteps)
        if (Array.isArray(steps2SubStepsArr)) {
          setSteps2SubSteps(steps2SubStepsArr)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      isReadStorageRef.current = true
    }
  }, [])

  const validStep = useCallback(
    (stepIndex: number) => {
      return !!steps[stepIndex]
    },
    [steps]
  )

  const validStep2SubStep = useCallback(
    (stepIndex: number) => {
      if (validStep(1)) return true
      return !!steps2SubSteps[stepIndex]
    },
    [validStep, steps2SubSteps]
  )

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

  const completeStep2SubStep = useCallback(
    (stepIndex: number) => {
      setSteps2SubSteps((steps) => {
        const newSteps = [...steps]
        newSteps[stepIndex] = true
        try {
          localStorage.setItem(GUIDE_STEPS_TWO_KEY, JSON.stringify(newSteps))
        } catch (error) {
          console.error(error)
        }
        if (
          newSteps.length >= GUIDE_STEPS_TWO_DEFAULT.length &&
          newSteps.every((item) => item)
        ) {
          completeStep(1)
        }
        return newSteps
      })
    },
    [completeStep]
  )

  useEffect(() => {
    if (!isReadStorageRef.current) return
    if (validStep(0)) return
    if (loadingDApps) return
    const step1Completed = dapps?.some((item) => !!item?.models?.length)
    if (step1Completed) {
      completeStep(0)
    }
  }, [dapps, loadingDApps, validStep, completeStep])

  const location = useLocation()
  useEffect(() => {
    if (!validStep(1)) {
      if (!validStep2SubStep(0)) {
        const isModelEditor = location.pathname.endsWith('model-editor')
        if (isModelEditor) {
          completeStep2SubStep(0)
        }
      }

      if (!validStep2SubStep(1)) {
        const isModelPlayground = location.pathname.endsWith('model-playground')
        if (isModelPlayground) {
          completeStep2SubStep(1)
        }
      }

      if (!validStep2SubStep(2)) {
        const isModelSdk = location.pathname.endsWith('model-sdk')
        if (isModelSdk) {
          completeStep2SubStep(2)
        }
      }

      if (!validStep2SubStep(3)) {
        const isStatistic = location.pathname.endsWith('statistic')
        if (isStatistic) {
          completeStep2SubStep(3)
        }
      }
    }

    if (!validStep(2)) {
      const isComponents = location.pathname.endsWith('components')
      if (isComponents) {
        completeStep(2)
      }
    }
  }, [
    location,
    validStep,
    validStep2SubStep,
    completeStep,
    completeStep2SubStep,
  ])

  return {
    steps,
    steps2SubSteps,
    validStep,
    validStep2SubStep,
    completeStep,
    completeStep2SubStep,
  }
}
