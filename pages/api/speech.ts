import { NextApiRequest, NextApiResponse } from 'next';

import { ELEVEN_LABS_API_KEY } from '@/utils/app/const';
import { ensureHasValidSession } from '@/utils/server/auth';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!(await ensureHasValidSession(req, res))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { text } = req.body as {
      text: string;
    };
    const result = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM?optimize_streaming_latency=0`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0,
            similarity_boost: 0,
          },
        }),
      },
    );
    res.status(result.status);
    if (result.status === 200) {
      const arrayBuffer = await result.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', arrayBuffer.byteLength);
      res.write(Buffer.from(arrayBuffer));
      res.end();
    } else {
      res.json(await result.json());
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export default handler;
