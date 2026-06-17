// Unit tests for the runtime profile store: seeding the builtin, adding/cloning
// user profiles, immutability of the builtin, and active-profile fallback. The
// store is a persisted singleton, so each test resets it to a builtin-only state.
import type { TPNProfile } from '@tpn/engine';
import { BUILTIN_PROFILE } from '../src/lib/profile';
import { BUILTIN_PROFILE_ID, useProfilesStore } from '../src/store/profiles';

const userProfile: TPNProfile = {
  ...structuredClone(BUILTIN_PROFILE),
  meta: { ...BUILTIN_PROFILE.meta, name: 'Test Center NICU' },
};

function reset() {
  const builtin = useProfilesStore.getState().profiles.find((p) => p.source === 'builtin');
  if (!builtin) throw new Error('builtin profile missing from store');
  useProfilesStore.setState({ profiles: [builtin], activeProfileId: BUILTIN_PROFILE_ID });
}

beforeEach(reset);

describe('profiles store', () => {
  it('seeds the builtin profile as the default active one', () => {
    const s = useProfilesStore.getState();
    expect(s.profiles).toHaveLength(1);
    expect(s.profiles[0].source).toBe('builtin');
    expect(s.activeProfileId).toBe(BUILTIN_PROFILE_ID);
  });

  it('adds a user profile and can activate it', () => {
    const id = useProfilesStore.getState().add(userProfile, { activate: true });
    const s = useProfilesStore.getState();
    expect(s.profiles).toHaveLength(2);
    expect(s.activeProfileId).toBe(id);
    expect(s.profiles.find((p) => p.id === id)?.source).toBe('user');
  });

  it('clones any profile as a new user profile with a distinct id and "(copy)" name', () => {
    const id = useProfilesStore.getState().clone(BUILTIN_PROFILE_ID);
    expect(id).toBeDefined();
    const copy = useProfilesStore.getState().profiles.find((p) => p.id === id);
    expect(copy?.source).toBe('user');
    expect(copy?.profile.meta.name).toContain('(copy)');
    // Cloning does not switch the active profile.
    expect(useProfilesStore.getState().activeProfileId).toBe(BUILTIN_PROFILE_ID);
  });

  it('never mutates or removes the builtin profile', () => {
    const edited: TPNProfile = { ...userProfile, meta: { ...userProfile.meta, name: 'Hacked' } };
    useProfilesStore.getState().update(BUILTIN_PROFILE_ID, edited);
    useProfilesStore.getState().remove(BUILTIN_PROFILE_ID);
    const s = useProfilesStore.getState();
    expect(s.profiles).toHaveLength(1);
    expect(s.profiles[0].profile.meta.name).toBe(BUILTIN_PROFILE.meta.name);
  });

  it('updates a user profile in place', () => {
    const id = useProfilesStore.getState().add(userProfile);
    const next: TPNProfile = { ...userProfile, meta: { ...userProfile.meta, name: 'Renamed' } };
    useProfilesStore.getState().update(id, next);
    expect(useProfilesStore.getState().profiles.find((p) => p.id === id)?.profile.meta.name).toBe('Renamed');
  });

  it('falls back to the builtin when the active user profile is removed', () => {
    const id = useProfilesStore.getState().add(userProfile, { activate: true });
    expect(useProfilesStore.getState().activeProfileId).toBe(id);
    useProfilesStore.getState().remove(id);
    expect(useProfilesStore.getState().activeProfileId).toBe(BUILTIN_PROFILE_ID);
    expect(useProfilesStore.getState().profiles).toHaveLength(1);
  });

  it('only switches to an existing profile', () => {
    useProfilesStore.getState().setActive('does-not-exist');
    expect(useProfilesStore.getState().activeProfileId).toBe(BUILTIN_PROFILE_ID);
  });
});
