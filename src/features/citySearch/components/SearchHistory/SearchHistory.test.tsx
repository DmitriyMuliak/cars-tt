import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { useWeatherStore } from '@/features/citySearch/store/citySearchStore';
import { render } from '@/test/render';

import { historyItemLabels } from '../HistoryItem/HistoryItem.labels';
import { SearchHistory } from './SearchHistory';
import { searchHistoryLabels } from './SearchHistory.labels';

function resetStore(cities: string[] = []) {
  const history = cities.map((city, i) => ({
    city,
    searchedAt: Date.now() - i * 1000,
  }));
  useWeatherStore.setState({ history, lastRemovedItems: [], activeCity: '' });
}

describe('SearchHistory', () => {
  beforeEach(() => resetStore());

  it('renders nothing when history is empty', () => {
    const { container } = render(SearchHistory);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders history items', () => {
    resetStore(['London', 'Paris', 'Tokyo']);
    render(SearchHistory);

    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
  });

  it('calls setActiveCity when a history item is clicked', async () => {
    resetStore(['London', 'Paris']);
    render(SearchHistory);

    await userEvent.click(
      screen.getByRole('button', { name: historyItemLabels.searchCity('London') }),
    );

    expect(useWeatherStore.getState().activeCity).toBe('London');
  });

  it('removes a city when the × button is clicked', async () => {
    resetStore(['London', 'Paris']);
    render(SearchHistory);

    await userEvent.click(
      screen.getByRole('button', { name: historyItemLabels.removeCity('London') }),
    );

    expect(useWeatherStore.getState().history.some((h) => h.city === 'London')).toBe(false);
  });

  it('stores removed item in lastRemovedItems', async () => {
    resetStore(['London', 'Paris']);
    render(SearchHistory);

    await userEvent.click(
      screen.getByRole('button', { name: historyItemLabels.removeCity('London') }),
    );

    expect(useWeatherStore.getState().lastRemovedItems[0]?.city).toBe('London');
  });

  it('clears all history when "Clear all" is clicked', async () => {
    resetStore(['London', 'Paris', 'Tokyo']);
    render(SearchHistory);

    await userEvent.click(screen.getByRole('button', { name: searchHistoryLabels.clearAll }));

    expect(useWeatherStore.getState().history).toHaveLength(0);
  });

  it('stores all items in lastRemovedItems after clear all', async () => {
    resetStore(['London', 'Paris', 'Tokyo']);
    render(SearchHistory);

    await userEvent.click(screen.getByRole('button', { name: searchHistoryLabels.clearAll }));

    expect(useWeatherStore.getState().lastRemovedItems).toHaveLength(3);
  });
});
