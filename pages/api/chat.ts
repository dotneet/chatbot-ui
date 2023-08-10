import { NextApiRequest, NextApiResponse } from 'next';

import { DEFAULT_SYSTEM_PROMPT } from '@/utils/app/const';
import { OpenAIStream } from '@/utils/server';
import { ensureHasValidSession, getUserToken } from '@/utils/server/auth';
import { createMessagesToSend } from '@/utils/server/message';
import { getTiktokenEncoding } from '@/utils/server/tiktoken';

import { ChatBodySchema } from '@/types/chat';

import path from 'node:path';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Vercel Hack
  // https://github.com/orgs/vercel/discussions/1278
  // eslint-disable-next-line no-unused-vars
  const vercelFunctionHack = path.resolve('./public', '');

  if (!(await ensureHasValidSession(req, res))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { model, messages, prompt, temperature } = ChatBodySchema.parse(
    req.body,
  );
  const key = await getUserToken(req, res);
  const encoding = await getTiktokenEncoding(model.id);
  try {
    let systemPromptToSend = prompt;
    if (!systemPromptToSend) {
      systemPromptToSend = DEFAULT_SYSTEM_PROMPT;
    }
    let { messages: messagesToSend, maxToken } = createMessagesToSend(
      encoding,
      model,
      systemPromptToSend,
      1000,
      messages,
    );
    if (messagesToSend.length === 0) {
      throw new Error('message is too long');
    }
    const stream = await OpenAIStream(
      model,
      systemPromptToSend,
      temperature,
      key,
      messagesToSend,
      maxToken,
    );
    res.status(200);
    res.writeHead(200, {
      Connection: 'keep-alive',
      'Content-Encoding': 'none',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
    });
    const decoder = new TextDecoder();
    const reader = stream.getReader();
    let closed = false;
    while (!closed) {
      await reader.read().then(({ done, value }) => {
        if (done) {
          closed = true;
          res.end();
        } else {
          const text = decoder.decode(value);
          res.write(text);
        }
      });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error' });
    }
  } finally {
    encoding.free();
  }
};

export default handler;
