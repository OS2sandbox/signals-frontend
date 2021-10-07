// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2019 - 2021 Gemeente Amsterdam
import { Fragment, useCallback, useContext, useEffect, useState } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { Row, Column, themeSpacing, Button, SearchBar } from '@amsterdam/asc-ui'
import styled from 'styled-components'

import useDebounce from 'hooks/useDebounce'
import { PAGE_SIZE } from 'containers/App/constants'
import LoadingIndicator from 'components/LoadingIndicator'
import Pagination from 'components/Pagination'
import PageHeader from 'signals/settings/components/PageHeader'
import DataView from 'components/DataView'
import { USERS_PAGED_URL, USER_URL } from 'signals/settings/routes'
import SettingsContext from 'signals/settings/context'
import { setUserFilters } from 'signals/settings/actions'
import { inputSelectRolesSelector } from 'models/roles/selectors'
import { inputSelectDepartmentsSelector } from 'models/departments/selectors'
import { makeSelectUserCan } from 'containers/App/selectors'
import Select from 'components/Select'
import useFetchUsers from './hooks/useFetchUsers'

type Params = {
  pageNum: string
}

const StyledPagination = styled(Pagination)`
  margin-top: ${themeSpacing(12)};
`

const HeaderButton = styled(Button)`
  &:hover {
    color: white;
  }
`

const StyledSearchbar = styled(SearchBar)`
  height: ${themeSpacing(11)};

  & div,
  & input {
    height: 100% !important;
  }

  > button {
    display: none;
  }
`

const StyledDataView = styled(DataView)`
  th:first-child,
  th:nth-child(2) {
    width: 25%;
  }

  th:last-child {
    width: 120px;
  }
`

const selectUserActive = [
  { key: 'all', name: 'Alles', value: '*' },
  { key: 'active', name: 'Actief', value: 'true' },
  { key: 'inactive', name: 'Niet actief', value: 'false' },
]

const UsersOverviewContainer = () => {
  const history = useHistory()
  const { pageNum } = useParams<Params>()
  const pageNumFromQueryString = pageNum ? Number.parseInt(pageNum, 10) : 1
  const [page, setPage] = useState(pageNumFromQueryString)
  const { state, dispatch } = useContext(SettingsContext)
  const {
    users: { filters },
  } = state
  const {
    get,
    isLoading,
    users: { list: data, count },
  } = useFetchUsers()
  const userCan = useSelector(makeSelectUserCan)
  const selectRoles = useSelector(inputSelectRolesSelector)
  const selectDepartments = useSelector(inputSelectDepartmentsSelector)
  const selectedDepartment =
    selectDepartments && filters.profile_department_code
      ? selectDepartments.find(
          ({ key }) => key === filters.profile_department_code
        ).value
      : ''

  useEffect(() => {
    // request a new data set when the page or the filters change
    get({ page, filters })
  }, [filters, page, get])

  useEffect(() => {
    // on page load, set the correct page number
    if (page !== pageNumFromQueryString) {
      setPage(pageNumFromQueryString)
    }
    // No need to changes in `page`, only update when the URL changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumFromQueryString])

  const setUsernameFilter = useCallback(
    (value) => {
      setPage(1)
      dispatch(setUserFilters({ username: value }))
    },
    [dispatch]
  )

  const createOnChangeFilter = useCallback(
    (event) => {
      const { value } = event.target

      setUsernameFilter(value)
    },
    [setUsernameFilter]
  )

  const debouncedOnChangeFilter = useDebounce(createOnChangeFilter, 250)

  const selectUserActiveOnChange = useCallback(
    (event) => {
      event.preventDefault()
      setPage(1)
      dispatch(setUserFilters({ is_active: event.target.value }))
    },
    [dispatch]
  )

  const selectRoleOnChange = useCallback(
    (event) => {
      event.preventDefault()
      setPage(1)
      dispatch(setUserFilters({ role: event.target.value }))
    },
    [dispatch]
  )

  const selectDepartmentOnChange = useCallback(
    (event) => {
      event.preventDefault()
      const selectedDepartment = selectDepartments.find(
        ({ value }) => value === event.target.value
      )

      setPage(1)
      dispatch(
        setUserFilters({ profile_department_code: selectedDepartment.key })
      )
    },
    [dispatch, selectDepartments]
  )

  const onItemClick = useCallback(
    (event) => {
      if (userCan('change_user') === false) {
        event.preventDefault()
        return
      }

      const {
        currentTarget: {
          dataset: { itemId },
        },
      } = event

      if (itemId) {
        history.push(`${USER_URL}/${itemId}`)
      }
    },
    [history, userCan]
  )

  const onPaginationClick = (pageToNavigateTo: number) => {
    history.push(`${USERS_PAGED_URL}/${pageToNavigateTo}`)
    global.window.scrollTo(0, 0)
  }

  const columnHeaders = ['Gebruikersnaam', 'Rol', 'Afdeling', 'Status']

  return (
    <Fragment>
      <PageHeader title={`Gebruikers${count ? ` (${count})` : ''}`}>
        {userCan('add_user') && (
          <HeaderButton variant="primary" forwardedAs={Link} to={USER_URL}>
            Gebruiker toevoegen
          </HeaderButton>
        )}
      </PageHeader>

      <Row data-testid="usersOverview">
        {isLoading && <LoadingIndicator />}

        <Column span={12} wrap>
          <Column span={12}>
            <StyledDataView
              headers={columnHeaders}
              filters={[
                <StyledSearchbar
                  placeholder=""
                  onChange={(event) => {
                    event.persist()
                    debouncedOnChangeFilter(event)
                  }}
                  onClear={() => setUsernameFilter('')}
                  value={filters.username}
                  data-testid="filterUsersByUsername"
                />,

                <Select
                  id="roleSelect"
                  name="roleSelect"
                  value={filters.role}
                  options={selectRoles}
                  optionKey="value"
                  onChange={selectRoleOnChange}
                />,

                <Select
                  id="departmentSelect"
                  name="departmentSelect"
                  value={selectedDepartment}
                  options={selectDepartments}
                  optionKey="value"
                  onChange={selectDepartmentOnChange}
                />,

                <Select
                  id="userActiveSelect"
                  name="userActiveSelect"
                  value={filters.is_active}
                  options={selectUserActive}
                  optionKey="value"
                  onChange={selectUserActiveOnChange}
                />,
              ]}
              columnOrder={columnHeaders}
              invisibleColumns={['id']}
              onItemClick={onItemClick}
              primaryKeyColumn="id"
              data={(!isLoading && data?.length > 0 && data) || []}
            />
          </Column>

          {!isLoading && count > 0 && (
            <Column span={12}>
              <StyledPagination
                currentPage={page}
                onClick={onPaginationClick}
                totalPages={Math.ceil(count / PAGE_SIZE)}
              />
            </Column>
          )}
        </Column>
      </Row>
    </Fragment>
  )
}

export default UsersOverviewContainer
