import { InferModel, sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer('id').primaryKey(), // provided by API Gateway the unique identifier of the user in X-User-Id
  email: varchar('email', { length: 256 }).notNull(), // provided by API Gateway the email of the user in X-User-Email
});

export type UserSchema = InferModel<typeof users, 'select'>;
export type NewUserSchema = InferModel<typeof users, 'insert'>;

// declaring enum in database
export const folderTypeEnum = pgEnum('type', ['chat', 'prompt']);

export const folders = pgTable('folders', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  type: folderTypeEnum('type').notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
});

export type FolderDBSchema = InferModel<typeof folders, 'select'>;
export type NewFolderDBSchema = InferModel<typeof folders, 'insert'>;

export const prompts = pgTable('prompts', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  description: text('description').notNull().default(''),
  content: text('content').notNull().default(''),
  modelId: varchar('model_id', { length: 100 }).notNull(), // model-id used in api call
  folderId: uuid('folder_id').references(() => folders.id),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
});

export type PromptDBSchema = InferModel<typeof prompts, 'select'>;
export type NewPromptDBSchema = InferModel<typeof prompts, 'insert'>;

export const messageRoleEnum = pgEnum('role', ['system', 'user', 'assistant']);

export const conversations = pgTable('conversations', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  modelId: varchar('model_id', { length: 100 }).notNull(), // model-id used in api call
  systemPrompt: text('system_prompt').notNull().default(''),
  messages: jsonb('messages')
    .$type<{ role: 'system' | 'user' | 'assistant'; content: string }[]>()
    .notNull(),
  temperature: real('temperature').notNull(),
  folderId: uuid('folder_id').references(() => folders.id),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
});

export type ConversationDBSchema = InferModel<typeof conversations, 'select'>;
export type NewConversationDBSchema = InferModel<
  typeof conversations,
  'insert'
>;

export const settingsThemeEnum = pgEnum('theme', ['light', 'dark']);

export const settings = pgTable('settings', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  theme: settingsThemeEnum('theme').notNull(),
  defaultTemperature: real('defaultTemperature').notNull().default(1.0),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull()
    .unique(),
});
