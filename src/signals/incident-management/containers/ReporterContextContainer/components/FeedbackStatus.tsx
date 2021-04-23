// Copyright (C) 2021 Gemeente Amsterdam
import { themeColor } from '@amsterdam/asc-ui'
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Theme } from 'types/theme'
import { Feedback } from '../types'

interface FeedbackStatusProps {
  feedback: Feedback
  className?: string
}

const Status = styled.span<{ feedback: Feedback; theme: Theme }>`
  ${({ feedback, theme }) => {
    if (feedback === null || !feedback.submitted_at) return

    return `color: ${themeColor(
      'support',
      feedback.is_satisfied ? 'valid' : 'invalid'
    )({ theme })}`
  }}
`

const FeedbackStatus: React.FC<FeedbackStatusProps> = ({
  feedback,
  className,
}) => {
  const text = useMemo(() => {
    if (!feedback) return '-'
    if (!feedback.submitted_at) return 'Niet ontvangen'
    if (!feedback.is_satisfied) return 'Niet tevreden'

    return 'Tevreden'
  }, [feedback])

  return (
    <Status className={className} feedback={feedback}>
      {text}
    </Status>
  )
}

export default FeedbackStatus
