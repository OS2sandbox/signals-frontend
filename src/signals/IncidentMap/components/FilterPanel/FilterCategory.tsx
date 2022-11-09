/* SPDX-License-Identifier: MPL-2.0 */
/* Copyright (C) 2022 Gemeente Amsterdam */
import { Checkbox } from '@amsterdam/asc-ui'

import { StyledImg, CategoryItemText, CategoryItem } from './styled'

export interface Props {
  selected: boolean
  text: string
  onToggleCategory: () => void
  icon?: string
}

export const FilterCategory = ({
  selected,
  text,
  onToggleCategory,
  icon,
}: Props) => (
  <CategoryItem htmlFor={text}>
    <Checkbox
      data-testid={text}
      id={text}
      checked={selected}
      onChange={onToggleCategory}
    />
    <StyledImg
      alt="icon"
      src={icon || 'assets/images/icon-incident-marker.svg'}
    />
    <CategoryItemText>{text}</CategoryItemText>
  </CategoryItem>
)