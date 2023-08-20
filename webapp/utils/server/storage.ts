import { Conversation } from '@/types/chat';
import { FolderInterface } from '@/types/folder';
import { Prompt } from '@/types/prompt';
import { Settings } from '@/types/settings';

import {
  conversations,
  folders,
  prompts,
  settings,
  users,
} from '@/db/schema';
import { LocalAIModelID, OpenAIModels, fallbackModelID } from '@/types/openai';
import { PostgresDB } from '@/db';

import { and, asc, eq } from 'drizzle-orm';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export interface ConversationCollectionItem {
  userId: number;
  conversation: Conversation;
}
export interface PromptsCollectionItem {
  userId: number;
  prompt: Prompt;
}

export interface FoldersCollectionItem {
  userId: number;
  folder: FolderInterface;
}

export interface SettingsCollectionItem {
  userId: number;
  settings: Settings;
}

export class UserDb {
  private _db: PostgresJsDatabase;

  constructor(_db: PostgresJsDatabase, private _userId: number) {
    this._db = _db;
  }

  static async fromUserId(userId: number, email: string): Promise<UserDb> {
    let user = await PostgresDB.select().from(users).where(eq(users.id, userId))
    if (user.length === 0){
      await PostgresDB.insert(users).values({
        id: userId,
        email: email
      })
    }
    return new UserDb(PostgresDB, userId);
  }

  // return all conversations from the user
  async getConversations(): Promise<Conversation[]> {
    let userConversations = await this._db
      .select({
        id: conversations.id,
        name: conversations.name,
        temperature: conversations.temperature,
        prompt: conversations.systemPrompt,
        folderId: conversations.folderId,
        messages: conversations.messages,
        model: {
          id: conversations.modelId,
        }
      })
      .from(conversations)
      .where(eq(conversations.userId, this._userId))

    return userConversations.map(
      (conversation) => {
        let model = fallbackModelID;
        if (Object.values(LocalAIModelID).some((r: string) => r === conversation.model.id)){
          model = <LocalAIModelID> conversation.model.id;
        }
        return {
          ...conversation,
          model: OpenAIModels[model],
        }
      }
    ) 
  }

  async saveConversation(conversation: Conversation) {
    return await this._db.insert(conversations)
      .values({
        id: conversation.id,
        name: conversation.name,
        temperature: conversation.temperature,
        systemPrompt: conversation.prompt,
        folderId: conversation.folderId,
        messages: conversation.messages,
        modelId: conversation.model.id,
        userId: this._userId,
      })
      .onConflictDoUpdate({
        target: folders.id,
        set: {
          name: conversation.name,
          temperature: conversation.temperature,
          systemPrompt: conversation.prompt,
          folderId: conversation.folderId,
          messages: conversation.messages,
          modelId: conversation.model.id
        }
      })  
  }

  async saveConversations(conversations: Conversation[]) {
    for (const conversation of conversations) {
      await this.saveConversation(conversation);
    }
  }

  async removeConversation(id: string) {
    await this._db.delete(conversations)
      .where(and(eq(conversations.userId, this._userId), eq(conversations.id, id)))
  }

  async removeAllConversations() {
    await this._db.delete(conversations).where(eq(conversations.userId, this._userId));
  }

  async getFolders(): Promise<FolderInterface[]> {
    const userFolders = await this._db.select({
      id: folders.id,
      name: folders.name,
      type: folders.type
    })
      .from(folders)
      .where(eq(folders.userId, this._userId))
      .orderBy(asc(folders.name))

    return userFolders;
  }

  async saveFolder(folder: FolderInterface) {
    return await this._db.insert(folders)
      .values({
        id: folder.id,
        name: folder.name,
        type: folder.type,
        userId: this._userId,
      })
      .onConflictDoUpdate({
        target: folders.id,
        set: {
          name: folder.name,
          type: folder.type,
          userId: this._userId,
        }
      })
  }

  async saveFolders(folders: FolderInterface[]) {
    for (const folder of folders) {
      await this.saveFolder(folder);
    }
  }

  async removeFolder(id: string) {
    return await this._db.delete(folders)
      .where(and(eq(folders.userId, this._userId), eq(folders.id, id)))
  }

  async removeAllFolders(type: 'chat' | 'prompt') {
    return await this._db.delete(folders)
      .where(and(eq(folders.userId, this._userId), eq(folders.type, type)))
  }

  async getPrompts(): Promise<Prompt[]> {
    const userPrompts = await this._db.select({
      id: prompts.id,
      name: prompts.name,
      description: prompts.description,
      content: prompts.content,
      folderId: prompts.folderId,
      model: {
        id: prompts.modelId
      }
    })
      .from(prompts)
      .where(eq(prompts.userId, this._userId))
      .orderBy(asc(prompts.name))
    return userPrompts.map(
      (prompt) => {
        let model = fallbackModelID;
        if (Object.values(LocalAIModelID).some((r: string) => r === prompt.model.id)){
          model = <LocalAIModelID> prompt.model.id;
        }
        return {
          ...prompt,
          model: OpenAIModels[model],
        }
      }
    )
  }

  async savePrompt(prompt: Prompt) {
    return await this._db.insert(prompts)
      .values({
        id: prompt.id,
        name: prompt.name,
        description: prompt.description,
        content: prompt.content,
        modelId: prompt.model.id,
        folderId: prompt.folderId,
        userId: this._userId,
      })
      .onConflictDoUpdate({
        target: prompts.id,
        set: {
          name: prompt.name,
          description: prompt.description,
          content: prompt.content,
          modelId: prompt.model.id,
          folderId: prompt.folderId,
          userId: this._userId,
        }
      })
  }

  async savePrompts(prompts: Prompt[]) {
    for (const prompt of prompts) {
      await this.savePrompt(prompt);
    }
  }

  async removePrompt(id: string) {
    return await this._db.delete(prompts)
      .where(and(eq(prompts.userId, this._userId), eq(prompts.id, id)))
      .returning()
  }

  async getSettings(): Promise<Settings> {
    const setting = await this._db.select({
      userId: settings.userId,
      theme: settings.theme,
      defaultTemperature: settings.defaultTemperature
    })
      .from(settings)
      .where(eq(settings.userId, this._userId))
    if(setting.length > 0){
      return setting[0]
    }
    let newSettings: Settings = {
      userId: this._userId,
      theme: 'dark',
      defaultTemperature: 1.0,
    }
    await this.saveSettings(newSettings);
    return newSettings
  }

  async saveSettings(updateSettings: Settings) {
    updateSettings.userId = this._userId;
    return await this._db.insert(settings)
    .values({
      theme: updateSettings.theme,
      defaultTemperature: updateSettings.defaultTemperature,
      userId: this._userId,
    })
    .onConflictDoUpdate({
      target: settings.id,
      set: {
        theme: updateSettings.theme,
        defaultTemperature: updateSettings.defaultTemperature,
        userId: this._userId,
      }
    })
  }
}
