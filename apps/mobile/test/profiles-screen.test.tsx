// Render tests for the profile management screens: the list shows the builtin as
// the active "Reference" profile, and its detail view exposes the right actions
// (no edit/delete for the builtin) and provenance.
import { render } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ProfileDetailScreen from '../src/app/profiles/[id]';
import ProfilesListScreen from '../src/app/profiles/index';
import { en } from '../src/lib/i18n/en';
import { BUILTIN_PROFILE } from '../src/lib/profile';
import { BUILTIN_PROFILE_ID } from '../src/store/profiles';

// The id literal must be inlined here: a jest.mock factory cannot reference an
// imported binding. It is asserted to equal BUILTIN_PROFILE_ID below.
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ id: 'espghan-2018-reference' }),
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen(node: React.ReactElement) {
  return render(React.createElement(SafeAreaProvider, { initialMetrics: metrics }, node));
}

describe('Profiles list screen', () => {
  it('lists the builtin profile with Reference and Active badges', () => {
    const { getByText, getAllByText } = renderScreen(React.createElement(ProfilesListScreen));
    expect(getByText(BUILTIN_PROFILE.meta.name)).toBeTruthy();
    expect(getByText(en.profiles.reference)).toBeTruthy();
    expect(getAllByText(en.profiles.activeBadge).length).toBeGreaterThan(0);
    expect(getByText(`+ ${en.profiles.newProfile}`)).toBeTruthy();
  });
});

describe('Profile detail screen — builtin', () => {
  it('keeps the inlined mock id in sync with the store constant', () => {
    expect(BUILTIN_PROFILE_ID).toBe('espghan-2018-reference');
  });

  it('shows it as active, hides edit/delete, and shows guideline provenance', () => {
    const { getByText, queryByText } = renderScreen(React.createElement(ProfileDetailScreen));
    // Active already → the "Set as active" CTA is hidden, the active marker shown.
    expect(getByText(`✓ ${en.profiles.isActive}`)).toBeTruthy();
    expect(queryByText(en.profiles.setActive)).toBeNull();
    // Builtin is immutable: no edit, no delete.
    expect(queryByText(en.profiles.edit)).toBeNull();
    expect(queryByText(en.common.delete)).toBeNull();
    // Clone is always available.
    expect(getByText(en.profiles.clone)).toBeTruthy();
    // Guideline-traceable provenance row from the builtin.
    expect(getByText('GIR (start/advance/max)')).toBeTruthy();
  });
});
