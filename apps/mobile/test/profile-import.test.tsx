// The import screen must reject malformed JSON and invalid profiles, and add a
// valid pasted profile as a user profile.
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ImportProfileScreen from '../src/app/profiles/import';
import { en } from '../src/lib/i18n/en';
import { BUILTIN_PROFILE } from '../src/lib/profile';
import { BUILTIN_PROFILE_ID, useProfilesStore } from '../src/store/profiles';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: (...a: unknown[]) => mockReplace(...a) },
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderImport() {
  return render(
    React.createElement(SafeAreaProvider, { initialMetrics: metrics }, React.createElement(ImportProfileScreen)),
  );
}

function reset() {
  const builtin = useProfilesStore.getState().profiles.find((p) => p.source === 'builtin');
  if (builtin) useProfilesStore.setState({ profiles: [builtin], activeProfileId: BUILTIN_PROFILE_ID });
  mockReplace.mockClear();
}

beforeEach(reset);

describe('Import profile screen', () => {
  it('rejects malformed JSON', () => {
    const { getByText, getByLabelText } = renderImport();
    fireEvent.changeText(getByLabelText(en.io.importTitle), '{ not json');
    fireEvent.press(getByText(en.io.importButton));
    expect(getByText(en.io.invalidJson)).toBeTruthy();
    expect(useProfilesStore.getState().profiles).toHaveLength(1);
  });

  it('rejects a structurally invalid profile', () => {
    const { getByText, getByLabelText } = renderImport();
    fireEvent.changeText(getByLabelText(en.io.importTitle), JSON.stringify({ meta: { name: 'x' } }));
    fireEvent.press(getByText(en.io.importButton));
    expect(getByText(en.io.invalidProfile)).toBeTruthy();
    expect(useProfilesStore.getState().profiles).toHaveLength(1);
  });

  it('adds a valid pasted profile as a user profile and navigates to it', () => {
    const { getByText, getByLabelText } = renderImport();
    const json = JSON.stringify({ ...BUILTIN_PROFILE, meta: { ...BUILTIN_PROFILE.meta, name: 'Imported NICU' } });
    fireEvent.changeText(getByLabelText(en.io.importTitle), json);
    fireEvent.press(getByText(en.io.importButton));

    const profiles = useProfilesStore.getState().profiles;
    expect(profiles).toHaveLength(2);
    expect(profiles[1].source).toBe('user');
    expect(profiles[1].profile.meta.name).toBe('Imported NICU');
    expect(mockReplace).toHaveBeenCalledWith(`/profiles/${profiles[1].id}`);
  });
});
