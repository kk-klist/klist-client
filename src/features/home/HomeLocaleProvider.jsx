import { HomeLocaleContext, getHomeCopy } from './homeLocale';

export function HomeLocaleProvider({ language, children }) {
  return (
    <HomeLocaleContext.Provider value={getHomeCopy(language)}>
      {children}
    </HomeLocaleContext.Provider>
  );
}
