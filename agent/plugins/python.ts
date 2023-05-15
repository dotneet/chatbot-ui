import {
  Action,
  Plugin,
  PluginExecutionResult,
  PythonInterpreterMeta,
} from '@/types/agent';

import { TaskExecutionContext } from './executor';

export default {
  nameForModel: 'python_interpreter',
  nameForHuman: 'Python Interpreter',
  descriptionForHuman: 'You can run python code here.',
  descriptionForModel: `The tool for running python code. The output text is treated as results of this tool. So program codes should ouput the results to stdout always. If the program codes are for create an image, write the image file to working directory. You can use the third party packages contained in this list ['numpy', 'pandas', 'matprotlib', 'opencv-python', 'requests']. This tool accept the json format input with the property 'code' only. 'code' property contains the python code to be executed. ex. {"code": "print('hello')"}. The code should be a valid python code. The code should print the results always. The code should not contain any infinite loops. The codes should not contain any input statements. When the image urls are returned as the results, that images should be displayed using markdown notation like this ![caption](url).`,
  displayForUser: true,
  execute: async (
    context: TaskExecutionContext,
    action: Action,
  ): Promise<PluginExecutionResult> => {
    const isJson = action.pluginInput.slice(0, 1) === '{';
    const uri = process.env.PYTHON_INTERPRETER_BACKEND || '';
    let code = '';
    if (isJson) {
      const json = JSON.parse(action.pluginInput);
      code = json['code'];
    } else {
      code = action.pluginInput;
    }
    const input = { type: 'python', code } as PythonInterpreterMeta;
    const response = await fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    const result = await response.json();
    return { output: JSON.stringify(result), meta: input };
  },
} as Plugin;
