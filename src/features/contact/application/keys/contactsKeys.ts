export const contactsKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactsKeys.all, 'list'] as const,
  detail: (id: number) => [...contactsKeys.all, 'detail', id] as const,
} as const;
