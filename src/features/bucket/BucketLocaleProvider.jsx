import { BucketLocaleContext, getBucketCopy } from './bucketLocale';

export function BucketLocaleProvider({ language, children }) {
  return (
    <BucketLocaleContext.Provider value={getBucketCopy(language)}>
      {children}
    </BucketLocaleContext.Provider>
  );
}
