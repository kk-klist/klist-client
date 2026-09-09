import { ProfileLocaleContext, getProfileCopy } from './profileLocale';

export function ProfileLocaleProvider({ language, children }) {
  return (
    <ProfileLocaleContext.Provider value={getProfileCopy(language)}>
      {children}
    </ProfileLocaleContext.Provider>
  );
}
