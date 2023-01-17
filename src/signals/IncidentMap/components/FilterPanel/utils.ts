/* SPDX-License-Identifier: MPL-2.0 */
/* Copyright (C) 2022 - 2023 Gemeente Amsterdam */
import configuration from 'shared/services/configuration/configuration'
import { defaultIcon } from 'shared/services/configuration/map-markers'
import type { Category } from 'types/category'
import type { SubCategory as SubCategoryBackend } from 'types/category'

import type { Filter, SubCategory } from '../../types'

export const getFilterCategoriesWithIcons = (
  categories: Category[]
): Filter[] => {
  return categories
    .filter(({ is_public_accessible }) => is_public_accessible)
    .map((category) => {
      const { sub_categories, _display, _links, name, slug } = category

      const categoriesWithIcons: Filter = {
        _display,
        filterActive: true,
        icon: _links['sia:icon']?.href ?? defaultIcon,
        name,
        slug,
        incidentsCount: 0,
      }

      if (sub_categories && showSubCategoryFilter(category.slug)) {
        categoriesWithIcons.subCategories = getSubCategories(sub_categories)
      }

      return categoriesWithIcons
    })
}

const getSubCategories = (
  subCategories: SubCategoryBackend[]
): SubCategory[] => {
  return subCategories
    .filter(({ is_public_accessible }) => is_public_accessible)
    .map((subCategory) => {
      const { name, _display, slug, _links } = subCategory
      return {
        _display,
        filterActive: true,
        icon: _links['sia:icon']?.href ?? defaultIcon,
        name,
        slug,
        incidentsCount: 0,
      }
    })
}

export const showSubCategoryFilter = (slug: Category['slug']) =>
  configuration.map.optionsIncidentMap.hasSubfiltersEnabled.includes(slug)
