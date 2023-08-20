import { integer, pgEnum, pgTable, serial, index, varchar, text, numeric, timestamp } from 'drizzle-orm/pg-core';
 
export const users = pgTable('users', {
  id: integer('id').primaryKey(),                       // provided by API Gateway the unique identifier of the user in X-User-Id
  email: varchar('email', { length: 256 }).notNull(),   // provided by API Gateway the email of the user in X-User-Email
});

// declaring enum in database
export const folderTypeEnum = pgEnum('type', ['chat', 'prompt']);

export const folders = pgTable('folders', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    type: folderTypeEnum('type'),
    userId: integer('user_id').references(()=>users.id).notNull()
});

export const prompts = pgTable('prompts', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: text('description'),
    content: text('content'),
    modelId: varchar('model_id', { length: 100 }).notNull(), // model-id used in api call
    folderId: integer('folder_id').references(()=>folders.id),
    userId: integer('user_id').references(()=>users.id).notNull(),
});


export const conversations = pgTable('conversations', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    modelId: varchar('model_id', { length: 100 }).notNull(), // model-id used in api call
    systemPrompt: text('system_prompt'),
    temperature: numeric('temperature', { precision: 2, scale: 2 }).notNull(),
    folderId: integer('folder_id').references(()=>folders.id),
    userId: integer('user_id').references(()=>users.id).notNull(),
});

export const messageRoleEnum = pgEnum('role', ['system', 'user', 'assistant']);

export const messages = pgTable('messages', {
    id: serial('id').primaryKey(),
    role: messageRoleEnum('role'),
    content: text('content'),
    conversationId: integer('conversation_id').references(()=>conversations.id),
    userId: integer('user_id').references(()=>users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (messages) => {
    return {
        createdAtIndex: index('created_at_index').on(messages.createdAt),
    };
});
  