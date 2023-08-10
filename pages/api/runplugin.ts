import { NextApiRequest, NextApiResponse } from 'next';

import { OpenAIError } from '@/utils/server';
import { ensureHasValidSession } from '@/utils/server/auth';

import { PluginResult, RunPluginRequest } from '@/types/agent';

import { createContext, executeTool } from '@/agent/plugins/executor';
import path from 'node:path';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Vercel Hack
  // https://github.com/orgs/vercel/discussions/1278
  // eslint-disable-next-line no-unused-vars
  const vercelFunctionHack = path.resolve('./public', '');

  if (!(await ensureHasValidSession(req, res))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const {
      taskId,
      model,
      action: toolAction,
    } = (await req.body) as RunPluginRequest;
    const verbose = process.env.DEBUG_AGENT_LLM_LOGGING === 'true';
    const context = createContext(taskId, req, model, verbose);
    const toolResult = await executeTool(context, toolAction);
    const result: PluginResult = {
      action: toolAction,
      result: toolResult,
    };
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAIError) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error' });
    }
  }
};

export default handler;
