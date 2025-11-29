export type NormalizerFn = (value: string) => string;

export type SearchFieldConfig<T> = Readonly<{
  key: keyof T & string;
  label: string;
}>;

export type SearchConfig<T> = Readonly<{
  fields: ReadonlyArray<SearchFieldConfig<T>>;
  defaultField: keyof T & string;
  normalize?: NormalizerFn;
}>;
