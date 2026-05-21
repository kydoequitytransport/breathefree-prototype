'use client'

import { useState } from 'react'
import type { ViewId } from '@/types'

export function useNavigation(initial: ViewId = 'onboarding') {
  const [activeView, setActiveView] = useState<ViewId>(initial)
  return { activeView, setActiveView }
}
