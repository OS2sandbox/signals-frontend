import React from 'react';
import { mount } from 'enzyme';
import { render } from '@testing-library/react';
import { withAppContext } from 'test/utils';
import * as definitions from 'signals/incident-management/definitions';
import { mainCategories, subCategories } from 'utils/__tests__/fixtures';
import configuration from 'shared/services/configuration/configuration';

import districts from 'utils/__tests__/fixtures/districts.json';
import sources from 'utils/__tests__/fixtures/sources.json';

import IncidentManagementContext from '../../../context';
import AppContext from '../../../../../containers/App/context';

import FilterTagList, { FilterTagListComponent, allLabelAppend, mapKeys } from '..';

jest.mock('shared/services/configuration/configuration');

const withContext = (Component, actualSources = null) =>
  withAppContext(
    <AppContext.Provider value={{ sources: actualSources }}>
      <IncidentManagementContext.Provider value={{ districts }}>{Component}</IncidentManagementContext.Provider>
    </AppContext.Provider>
  );

describe('signals/incident-management/containers/FilterTagList', () => {
  const tags = {
    status: [definitions.statusList[1]],
    feedback: 'satisfied',
    priority: [{ key: 'normal', value: 'Normaal' }],
    stadsdeel: [definitions.stadsdeelList[0], definitions.stadsdeelList[1]],
    address_text: 'februariplein 1',
    incident_date: '2019-09-17',
    source: [definitions.sourceList[0], definitions.sourceList[1]],
    category_slug: [
      {
        key: 'https://acc.api.data.amsterdam.nl/signals/v1/public/terms/categories/afval/sub_categories/asbest-accu',
        value: 'Asbest / accu',
        slug: 'asbest-accu',
      },
    ],
  };

  afterEach(() => {
    configuration.__reset();
  });

  it('should have props from structured selector', () => {
    const tree = mount(withContext(<FilterTagList />));

    const props = tree.find(FilterTagListComponent).props();

    expect(props.subCategories).not.toBeUndefined();
    expect(props.mainCategories).not.toBeUndefined();
  });

  describe('date formatting', () => {
    it('renders created before', () => {
      const { queryByText } = render(
        withContext(
          <FilterTagListComponent
            tags={{ ...tags, created_before: '2019-09-23' }}
            subCategories={subCategories}
            mainCategories={mainCategories}
          />
        )
      );

      const createdBeforeLabel = 'Datum: t/m 23-09-2019';

      expect(queryByText(createdBeforeLabel)).toBeInTheDocument();
    });

    it('renders date after', () => {
      const { queryByText } = render(
        withContext(
          <FilterTagListComponent
            tags={{ ...tags, created_after: '2019-09-17' }}
            subCategories={subCategories}
            mainCategories={mainCategories}
          />
        )
      );

      const createdAfterLabel = 'Datum: 17-09-2019 t/m nu';

      expect(queryByText(createdAfterLabel)).toBeInTheDocument();
    });

    it('renders both date after and date before', () => {
      const { queryByText } = render(
        withContext(
          <FilterTagListComponent
            tags={{
              ...tags,
              created_before: '2019-09-23',
              created_after: '2019-09-17',
            }}
            subCategories={subCategories}
            mainCategories={mainCategories}
          />
        )
      );

      const createdBeforeAfterLabel = 'Datum: 17-09-2019 t/m 23-09-2019';

      expect(queryByText(createdBeforeAfterLabel)).toBeInTheDocument();
    });
  });

  describe('tags list', () => {
    const maincategory_slug = [
      {
        key: 'https://acc.api.data.amsterdam.nl/signals/v1/public/terms/categories/afval',
        value: 'Afval',
        slug: 'afval',
      },
    ];

    it('shows an extra label when a tag is a main category', () => {
      const { rerender, queryByText } = render(
        withContext(
          <FilterTagListComponent tags={tags} subCategories={subCategories} mainCategories={mainCategories} />
        )
      );

      expect(queryByText(`${maincategory_slug[0].value}${allLabelAppend}`)).toBeFalsy();

      const tagsWithMainCat = { ...tags, maincategory_slug };

      rerender(
        withContext(
          <FilterTagListComponent
            tags={tagsWithMainCat}
            subCategories={subCategories}
            mainCategories={mainCategories}
          />
        )
      );

      expect(queryByText(`${maincategory_slug[0].value}${allLabelAppend}`)).toBeTruthy();
    });

    it('renders a list of tags', () => {
      const { queryAllByTestId, queryByText } = render(
        withContext(
          <FilterTagListComponent tags={tags} subCategories={subCategories} mainCategories={mainCategories} />
        )
      );

      expect(queryByText(definitions.priorityList[1].value)).toBeInTheDocument();
      expect(queryByText(definitions.feedbackList[0].value)).toBeInTheDocument();
      expect(queryByText(tags.address_text)).toBeInTheDocument();
      expect(queryByText(definitions.stadsdeelList[0].value)).toBeInTheDocument();
      expect(queryByText(definitions.stadsdeelList[1].value)).toBeInTheDocument();
      expect(queryByText(districts[0].value)).not.toBeInTheDocument();
      expect(queryByText(definitions.sourceList[0].value)).toBeInTheDocument();
      expect(queryByText(definitions.sourceList[1].value)).toBeInTheDocument();
      expect(queryByText(sources[0].value)).not.toBeInTheDocument();

      expect(queryAllByTestId('filterTagListTag')).toHaveLength(10);
    });

    it('works with feature flag fetchDistrictsFromBackend enabled', () => {
      configuration.fetchDistrictsFromBackend = true;

      const { stadsdeel, ...otherTags } = tags;
      const { queryAllByTestId, queryByText } = render(
        withContext(
          <FilterTagListComponent
            tags={{
              ...otherTags,
              area: [districts[0]],
            }}
            subCategories={subCategories}
            mainCategories={mainCategories}
          />
        )
      );

      expect(queryByText(definitions.priorityList[1].value)).toBeInTheDocument();
      expect(queryByText(definitions.feedbackList[0].value)).toBeInTheDocument();
      expect(queryByText(tags.address_text)).toBeInTheDocument();
      expect(queryByText(definitions.stadsdeelList[0].value)).not.toBeInTheDocument();
      expect(queryByText(definitions.stadsdeelList[1].value)).not.toBeInTheDocument();
      expect(queryByText(districts[0].value)).toBeInTheDocument();
      expect(queryByText(definitions.sourceList[0].value)).toBeInTheDocument();
      expect(queryByText(definitions.sourceList[1].value)).toBeInTheDocument();
      expect(queryByText(sources[0].value)).not.toBeInTheDocument();

      expect(queryAllByTestId('filterTagListTag')).toHaveLength(9);
    });

    it('works with feature flag fetchSourcesFromBackend enabled', () => {
      configuration.fetchSourcesFromBackend = true;

      const { queryAllByTestId, queryByText } = render(
        withContext(
          <FilterTagListComponent
            tags={{
              ...tags,
              source: [sources[0]],
            }}
            subCategories={subCategories}
            mainCategories={mainCategories}
          />,
          sources
        )
      );

      expect(queryByText(definitions.priorityList[1].value)).toBeInTheDocument();
      expect(queryByText(definitions.feedbackList[0].value)).toBeInTheDocument();
      expect(queryByText(tags.address_text)).toBeInTheDocument();
      expect(queryByText(definitions.stadsdeelList[0].value)).toBeInTheDocument();
      expect(queryByText(definitions.stadsdeelList[1].value)).toBeInTheDocument();
      expect(queryByText(districts[0].value)).not.toBeInTheDocument();
      expect(queryByText(definitions.sourceList[0].value)).not.toBeInTheDocument();
      expect(queryByText(definitions.sourceList[1].value)).not.toBeInTheDocument();
      expect(queryByText(sources[0].value)).toBeInTheDocument();

      expect(queryAllByTestId('filterTagListTag')).toHaveLength(9);
    });

    it('renders tags that have all items selected', () => {
      const groupedTags = {
        status: definitions.statusList,
        stadsdeel: definitions.stadsdeelList,
        source: definitions.sourceList,
        priority: definitions.priorityList,
      };

      const { queryByText } = render(
        withContext(
          <FilterTagListComponent tags={groupedTags} subCategories={subCategories} mainCategories={mainCategories} />
        )
      );

      expect(queryByText(`status${allLabelAppend}`)).toBeInTheDocument();
      expect(queryByText(`stadsdeel${allLabelAppend}`)).toBeInTheDocument();
      expect(queryByText(`bron${allLabelAppend}`)).toBeInTheDocument();
      expect(queryByText(`urgentie${allLabelAppend}`)).toBeInTheDocument();
    });

    it('renders no list when tags are undefined', () => {
      const { queryAllByTestId } = render(
        withContext(<FilterTagListComponent subCategories={subCategories} mainCategories={mainCategories} />)
      );

      expect(queryAllByTestId('filterTagListTag')).toHaveLength(0);
    });
  });

  it('should map keys', () => {
    expect(mapKeys('source')).toEqual('bron');
    expect(mapKeys('any_key')).toEqual('any_key');
    expect(mapKeys('priority')).toEqual('urgentie');
    expect(mapKeys('contact_details')).toEqual('contact');
  });
});
