import type { TPNProfile } from '@tpn/engine';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BUILTIN_PROFILE, BUILTIN_PROFILE_ID } from '../lib/profile';

export type ProfileSource = 'builtin' | 'user';

export interface StoredProfile {
  id: string;
  source: ProfileSource;
  profile: TPNProfile;
  createdAt: string;
  updatedAt: string;
}

interface ProfilesState {
  profiles: StoredProfile[];
  activeProfileId: string;
  hydrated: boolean;
  setActive: (id: string) => void;
  add: (profile: TPNProfile, opts?: { activate?: boolean }) => string;
  update: (id: string, profile: TPNProfile) => void;
  remove: (id: string) => void;
  clone: (id: string) => string | undefined;
}

const epoch = new Date(0).toISOString();

function makeBuiltin(): StoredProfile {
  return {
    id: BUILTIN_PROFILE_ID,
    source: 'builtin',
    profile: BUILTIN_PROFILE,
    createdAt: epoch,
    updatedAt: epoch,
  };
}

function makeId(): string {
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useProfilesStore = create<ProfilesState>()(
  persist(
    (set, get) => ({
      profiles: [makeBuiltin()],
      activeProfileId: BUILTIN_PROFILE_ID,
      hydrated: false,

      setActive: (id) => {
        if (get().profiles.some((p) => p.id === id)) {
          set({ activeProfileId: id });
        }
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
        const now = new Date().toISOString();
        set((s) => ({
          profiles: s.profiles.map((p) => (p.id === id && p.source === 'user' ? { ...p, profile, updatedAt: now } : p)),
        }));
      },

      remove: (id) => {
        set((s) => {
          const target = s.profiles.find((p) => p.id === id);
          if (!target || target.source === 'builtin') {
            return s;
          }
          return {
            profiles: s.profiles.filter((p) => p.id !== id),
            activeProfileId: s.activeProfileId === id ? BUILTIN_PROFILE_ID : s.activeProfileId,
          };
        });
      },

      clone: (id) => {
        const target = get().profiles.find((p) => p.id === id);
        if (!target) {
          return undefined;
        }
        const copy = structuredClone(target.profile);
        copy.meta.name = `${copy.meta.name} (copy)`;
        return get().add(copy, { activate: false });
      },
    }),
    {
      name: 'tpn.profiles.v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ profiles: s.profiles, activeProfileId: s.activeProfileId }),
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
        }
      },
    },
  ),
);

/** The active profile's clinical config — for engine calls / display. */
export function useActiveProfile(): TPNProfile {
  return useProfilesStore((s) => s.profiles.find((p) => p.id === s.activeProfileId)?.profile ?? BUILTIN_PROFILE);
}

/** The active profile record (id/source/timestamps) — for management UI. */
export function useActiveStoredProfile(): StoredProfile {
  return useProfilesStore((s) => s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0] ?? makeBuiltin());
}
