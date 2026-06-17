import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TPNProfile } from '@tpn/engine';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BUILTIN_PROFILE } from '../lib/profile';

// Runtime profile management: multiple profiles, one active, persisted to the
// device. The bundled reference ships as an undeletable, uneditable "builtin"
// that seeds the store; everything the user creates is a "user" profile. No
// clinical logic lives here — profiles are opaque configuration for the engine.

export const BUILTIN_PROFILE_ID = 'espghan-2018-reference';

export type ProfileSource = 'builtin' | 'user';

export interface StoredProfile {
  id: string;
  source: ProfileSource;
  profile: TPNProfile;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

/** The builtin record, always rebuilt from the bundled constant so reference
 * updates ship to existing installs (see `merge`). */
function makeBuiltin(): StoredProfile {
  const epoch = new Date(0).toISOString();
  return { id: BUILTIN_PROFILE_ID, source: 'builtin', profile: BUILTIN_PROFILE, createdAt: epoch, updatedAt: epoch };
}

function makeId(): string {
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface ProfilesState {
  profiles: StoredProfile[];
  activeProfileId: string;
  /** True once persisted state has been read back (or failed to). */
  hydrated: boolean;
  setActive: (id: string) => void;
  /** Adds a user profile; returns its id. */
  add: (profile: TPNProfile, opts?: { activate?: boolean }) => string;
  /** Replaces a user profile's content (builtin is immutable). */
  update: (id: string, profile: TPNProfile) => void;
  /** Removes a user profile (builtin cannot be removed). */
  remove: (id: string) => void;
  /** Duplicates any profile as a new user profile; returns the new id. */
  clone: (id: string) => string | undefined;
}

export const useProfilesStore = create<ProfilesState>()(
  persist(
    (set, get) => ({
      profiles: [makeBuiltin()],
      activeProfileId: BUILTIN_PROFILE_ID,
      hydrated: false,

      setActive: (id) => {
        if (get().profiles.some((p) => p.id === id)) set({ activeProfileId: id });
      },

      add: (profile, opts) => {
        const id = makeId();
        const now = new Date().toISOString();
        const entry: StoredProfile = { id, source: 'user', profile, createdAt: now, updatedAt: now };
        set((s) => ({
          profiles: [...s.profiles, entry],
          activeProfileId: opts?.activate ? id : s.activeProfileId,
        }));
        return id;
      },

      update: (id, profile) => {
        set((s) => ({
          profiles: s.profiles.map((p) =>
            p.id === id && p.source === 'user' ? { ...p, profile, updatedAt: new Date().toISOString() } : p,
          ),
        }));
      },

      remove: (id) => {
        set((s) => {
          const target = s.profiles.find((p) => p.id === id);
          if (!target || target.source === 'builtin') return s;
          return {
            profiles: s.profiles.filter((p) => p.id !== id),
            activeProfileId: s.activeProfileId === id ? BUILTIN_PROFILE_ID : s.activeProfileId,
          };
        });
      },

      clone: (id) => {
        const source = get().profiles.find((p) => p.id === id);
        if (!source) return undefined;
        const copy: TPNProfile = {
          ...structuredClone(source.profile),
          meta: { ...source.profile.meta, name: `${source.profile.meta.name} (copy)` },
        };
        return get().add(copy, { activate: false });
      },
    }),
    {
      name: 'tpn.profiles.v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Functions and the transient `hydrated` flag are not persisted.
      partialize: (s) => ({ profiles: s.profiles, activeProfileId: s.activeProfileId }),
      // Keep a fresh builtin (so reference updates ship), preserve user profiles,
      // and guarantee the active id points at an existing profile.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Pick<ProfilesState, 'profiles' | 'activeProfileId'>>;
        const userProfiles = (p.profiles ?? []).filter((x) => x?.source === 'user');
        const profiles = [makeBuiltin(), ...userProfiles];
        const activeProfileId =
          p.activeProfileId && profiles.some((x) => x.id === p.activeProfileId)
            ? p.activeProfileId
            : BUILTIN_PROFILE_ID;
        return { ...current, profiles, activeProfileId };
      },
      onRehydrateStorage: () => () => {
        useProfilesStore.setState({ hydrated: true });
      },
    },
  ),
);

/** The active profile (falls back to the builtin), for engine calls and display. */
export function useActiveProfile(): TPNProfile {
  return useProfilesStore((s) => s.profiles.find((p) => p.id === s.activeProfileId)?.profile ?? BUILTIN_PROFILE);
}

/** The active stored record (with id/source), for chips and management UI. */
export function useActiveStoredProfile(): StoredProfile {
  return useProfilesStore((s) => s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]);
}
