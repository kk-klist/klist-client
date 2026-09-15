import {
  BucketLanguageContext,
  BucketLocaleContext,
  getBucketCopy,
  getBucketLanguage,
} from './bucketLocale';

export function BucketLocaleProvider({ language, children }) {
  const resolvedLanguage = getBucketLanguage(language);

  return (
    <BucketLanguageContext.Provider value={resolvedLanguage}>
      <BucketLocaleContext.Provider value={getBucketCopy(resolvedLanguage)}>
        {children}
      </BucketLocaleContext.Provider>
    </BucketLanguageContext.Provider>
  );
}
