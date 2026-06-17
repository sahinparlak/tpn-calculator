// Render smoke test for the Result screen: it must surface the hard-warning
// banner (and hide the all-clear card) for an unsafe admixture. Pairs with
// `calculation.test.ts`, which proves the engine raises the warning — this proves
// the UI actually shows it.
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ResultScreen from '../src/app/result';
import { en } from '../src/lib/i18n/en';
import { usePatientStore } from '../src/store/patient';

// The screen imports the router for its nav buttons; we never tap them here.
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

// Insets so `SafeAreaView` / `useSafeAreaInsets` resolve without a real device.
const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderResult() {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <ResultScreen />
    </SafeAreaProvider>,
  );
}

describe('Result screen — render smoke', () => {
  beforeEach(() => {
    usePatientStore.getState().set({ weight: '1.8', age: '1', line: 'peripheral' });
  });

  it('shows the hard-warning banner for an unsafe preterm on a peripheral line', () => {
    const { getByText } = renderResult();
    expect(getByText(en.result.mustNotUse, { exact: false })).toBeTruthy();
  });

  it('does not show the all-clear card when there are hard warnings', () => {
    const { queryByText } = renderResult();
    expect(queryByText(en.result.noWarnings, { exact: false })).toBeNull();
  });
});
