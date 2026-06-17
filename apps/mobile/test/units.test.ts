// Unit-label derivation: the engine emits numbers in the profile's own units, so
// the UI only needs to label them. These tests prove the labels follow the
// profile's `units` (mmol/kcal vs mEq/kJ), end-to-end on the Result screen.
import { render } from '@testing-library/react-native';
import type { TPNProfile } from '@tpn/engine';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ResultScreen from '../src/app/result';
import { BUILTIN_PROFILE } from '../src/lib/profile';
import { unitLabels } from '../src/lib/units';
import { usePatientStore } from '../src/store/patient';
import { useProfilesStore } from '../src/store/profiles';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function withUnits(energy: 'kcal' | 'kJ', electrolyte: 'mmol' | 'mEq'): TPNProfile {
  return { ...structuredClone(BUILTIN_PROFILE), units: { energy, electrolyte } };
}

describe('unitLabels', () => {
  it('uses mmol/kcal labels for the default profile', () => {
    const u = unitLabels(withUnits('kcal', 'mmol'));
    expect(u.electrolytePerKg).toBe('mmol/kg');
    expect(u.energyPerKg).toBe('kcal/kg');
    expect(u.energy).toBe('kcal');
    expect(u.caPhosphateProduct).toBe('(mmol/L)²');
  });

  it('flips to mEq/kJ labels when the profile uses those units', () => {
    const u = unitLabels(withUnits('kJ', 'mEq'));
    expect(u.electrolytePerKg).toBe('mEq/kg');
    expect(u.energyPerKg).toBe('kJ/kg');
    expect(u.energy).toBe('kJ');
    expect(u.caPhosphateProduct).toBe('(mEq/L)²');
  });
});

describe('Result screen — unit labels follow the active profile', () => {
  // This is the last suite in the file and Jest isolates module state per file,
  // so the activated profile below does not leak to other suites.
  it('renders mEq/kg (not mmol/kg) when the active profile uses mEq', () => {
    useProfilesStore.getState().add(withUnits('kJ', 'mEq'), { activate: true });
    usePatientStore.getState().set({ weight: '1.8', age: '1', line: 'central' });

    const { getByText, queryByText } = render(
      React.createElement(SafeAreaProvider, { initialMetrics: metrics }, React.createElement(ResultScreen)),
    );

    expect(getByText('mEq/kg')).toBeTruthy();
    expect(queryByText('mmol/kg')).toBeNull();
  });
});
