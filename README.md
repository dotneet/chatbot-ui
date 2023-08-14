# Local Smart Chatbot UI

This repo is forked from [smart-chatbot-ui](https://github.com/dotneet/smart-chatbot-ui), which is forked from [chatbot-ui](https://github.com/mckaywrigley/chatbot-ui).

The purpose of this secondary fork is to make the Chatbot UI compatible with a locally deployed LLM API. The API used in this example is one that is openAI-compatible, referenced from [VLLM's openapi example](https://github.com/lm-sys/FastChat/blob/main/fastchat/serve/openai_api_server.py).

This repository is highly experimental, so please do not expect compatibility when performing updates.

## Additional Features

- Persistent storage(MongoDB)
- Local API support
- Auth injected by nginx reverse proxy, simulating an auth solution by API gateway with idendity provider like keycloak.

![Chatbot UI](./docs/screenshot_2023-05-08.png)

## Deploy

**Docker**

Setup enviroment variables:

```bash
cp .env.example .env
# specify MONGODB_URI, MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD
vim .env
```

Run with docker-compose:

```shell
make start-dev
```

## Usage

You should be able to start chatting.

## Configuration

When deploying the application, the following environment variables can be set:

| Environment Variable              | Default value                  | Description                                                                                                                               |
| --------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| OPENAI_API_HOST                   | `http://openai-apiserver/api`       | The base url, for Azure use `https://<endpoint>.openai.azure.com`                                                                         |
DEFAULT_MODEL                     | `wizard-vicuna-13b-hf`                | The default model to use on new conversations, for Azure use `gpt-35-turbo`                                                               |
| MONGODB_URI                       |                                | See [Official Document](https://www.mongodb.com/docs/manual/reference/connection-string/)                                                 |
| MONGODB_DB                        | `chatui`                       | MongoDB database name                                                                                                                     |

