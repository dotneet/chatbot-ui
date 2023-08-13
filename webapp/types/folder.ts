import * as z from 'zod';

export const FolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.union([z.literal('chat'), z.literal('prompt')]),
});

export const FolderSchemaArray = z.array(FolderSchema);
export type FolderType = z.infer<typeof FolderSchema>['type'];
export type FolderInterface = z.infer<typeof FolderSchema>;
