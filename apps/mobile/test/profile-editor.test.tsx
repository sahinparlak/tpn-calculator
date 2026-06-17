// The editor must gate saving on validity: a valid draft enables Save; clearing a
// required field surfaces the validation notice and disables Save. This proves the
// engine's validateProfile is wired into the form.
import { fireEvent, render } from '@testing-library/react-native';
import type { TPNProfile } from '@tpn/engine';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ProfileEditScreen from '../src/app/profiles/edit/[id]';
import { en } from '../src/lib/i18n/en';
import { BUILTIN_PROFILE } from '../src/lib/profile';
import { useProfilesStore } from '../src/store/profiles';

// `mock`-prefixed names are allowed inside a jest.mock factory; set per test.
let mockEditId = '';
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ id: mockEditId }),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderEditor() {
  return render(
    React.createElement(SafeAreaProvider, { initialMetrics: metrics }, React.createElement(ProfileEditScreen)),
  );
}

function seedUserProfile(): string {
  const copy: TPNProfile = { ...structuredClone(BUILTIN_PROFILE), meta: { ...BUILTIN_PROFILE.meta, name: 'My NICU' } };
  return useProfilesStore.getState().add(copy);
}

describe('Profile editor — validation gating', () => {
  it('enables save for a valid draft and blocks it once a field is cleared', () => {
    mockEditId = seedUserProfile();
    const { getByText, getByLabelText, queryByText } = renderEditor();

    // A clone of the (valid) builtin starts valid: no notice.
    expect(queryByText(en.editor.invalid)).toBeNull();
    expect(getByText(en.editor.save)).toBeTruthy();

    // Clear GIR start → NaN → invalid → notice appears.
    fireEvent.changeText(getByLabelText(/GIR start/), '');
    expect(getByText(en.editor.invalid)).toBeTruthy();
  });

  it('shows a read-only notice for the builtin', () => {
    mockEditId = 'espghan-2018-reference';
    const { getByText } = renderEditor();
    expect(getByText(en.editor.readonly)).toBeTruthy();
  });
});
