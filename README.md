# OpenGPT | Free AI Chat UI

## News

Forked from the amazing project from McKay of [Twitter](https://twitter.com/mckaywrigley) fame.

This project is actively maintained and will be extended to support 

Initial focus is on merging all outstanding PRs and fixing bugs.

## About

An open source UI for use with cloud and local LLMs. Integrates with a wide range of models.

It is built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/).

### [Launch OpenGPT now!](https://sage-gnome-98d99a.netlify.app/)

Please only use with information you're happy to share 😉

![Chatbot UI](./docs/screenshot_2023-05-08.png)

## Technical Specs

[Features](FEATURES.md)

## Deploy

**Docker**

Setup enviroment variables:

```bash
cp .env.local.example .env.local
# specify OPENAI_API_KEY, MONGODB_URI, MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD
vim .env.local
```

Run with docker-compose:

```shell
docker compose up -d
```

## Running Locally

**1. Clone Repo**

```bash
git clone https://github.com/dotneet/smart-chatbot-ui.git
```

**2. Install Dependencies**

```bash
npm i
```

**3. Provide OpenAI API Key**

Create a .env.local file in the root of the repo with your OpenAI API Key:

```bash
cp .env.local.example .env.local
# Specify OPENAI_API_KEY
vim .env.local
```

> You can set `OPENAI_API_HOST` where access to the official OpenAI host is restricted or unavailable, allowing users to configure an alternative host for their specific needs.

> Additionally, if you have multiple OpenAI Organizations, you can set `OPENAI_ORGANIZATION` to specify one.

**4. Run MongoDB**

```bash
docker compose -f docker-compose.dev.yml up -d
```

**5. Run App**

```bash
npm run dev
```

**6. Use it**

You should be able to start chatting.

## Configuration

When deploying the application, the following environment variables can be set:

| Environment Variable              | Default value                  | Description                                                                                                                               |
| --------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| OPENAI_API_KEY                    |                                | The default API key used for authentication with OpenAI                                                                                   |
| OPENAI_API_HOST                   | `https://api.openai.com`       | The base url, for Azure use `https://<endpoint>.openai.azure.com`                                                                         |
| OPENAI_API_TYPE                   | `openai`                       | The API type, options are `openai` or `azure`                                                                                             |
| OPENAI_API_VERSION                | `2023-03-15-preview`           | Only applicable for Azure OpenAI                                                                                                          |
| AZURE_DEPLOYMENT_ID_EMBEDDINGS    |                                | Specify model deployment ID used for embeddings. Needed when Azure OpenAI, Ref [Azure OpenAI API](https://learn.microsoft.com/zh-cn/azure/cognitive-services/openai/reference#completions) |
| OPENAI_ORGANIZATION               |                                | Your OpenAI organization ID                                                                                                               |
| DEFAULT_MODEL                     | `gpt-3.5-turbo`                | The default model to use on new conversations, for Azure use `gpt-35-turbo`                                                               |
| NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT | [see here](utils/app/const.ts) | The default system prompt to use on new conversations                                                                                     |
| GOOGLE_API_KEY                    |                                | See [Custom Search JSON API documentation][GCSE]                                                                                          |
| GOOGLE_CSE_ID                     |                                | See [Custom Search JSON API documentation][GCSE]                                                                                          |
| MONGODB_URI                       |                                | See [Official Document](https://www.mongodb.com/docs/manual/reference/connection-string/)                                                 |
| MONGODB_DB                        | `opengpt`                       | MongoDB database name                                                                                                                     |
| NEXTAUTH_ENABLED                  | `false`                        | Enable SSO authentication. set 'true' or 'false'                                                                                          |
| NEXTAUTH_EMAIL_PATTERN            |                                | The email regex pattern granted access to chatbot-ui (ex `.+@example.com`)                                                                |
| NEXTAUTH_URL                      | `http://localhost:3000`        | NextAuth Settings. See [Official Document](https://next-auth.js.org/configuration/options)                                                |
| NEXTAUTH_SECRET                   |                                | NextAuth Settings. See [Official Document](https://next-auth.js.org/configuration/options)                                                |
| GITHUB_CLIENT_ID                  |                                | GitHub OAuth Client ID for NextAuth                                                                                                       |
| GITHUB_CLIENT_SECRET              |                                | GitHub OAuth Client Secret for NextAuth                                                                                                   |
| GOOGLE_CLIENT_ID                  |                                | Google OAuth Client ID for NextAuth                                                                                                       |
| GOOGLE_CLIENT_SECRET              |                                | Google OAuth Client Secret for NextAuth                                                                                                   |
| COGNITO_CLIENT_ID                 |                                | Cognito App Client ID                                                                                                                     |
| COGNITO_CLIENT_SECRET             |                                | Cognito App Client Secret                                                                                                                 |
| COGNITO_ISSUER                    |                                | Cognito Identity Provider Issuer                                                                                                          |
| AZURE_AD_CLIENT_ID                |                                | Azure AD Application (client) ID (see: [Quickstart AD](https://learn.microsoft.com/en-us/azure/active-directory/develop/))                |
| AZURE_AD_TENANT_ID                |                                | Azure AD Directory (tenant) ID                                                                                                            |
| AZURE_AD_CLIENT_SECRET            |                                | Azure AD Client secret value (Certificates & secrets > Client Secrets > New Client Secret > Value)                                        |
| SUPPORT_EMAIL                     |                                | Specify the support email address to show users in case of errors or issues are encountered while using the application.                  |
| PROMPT_SHARING_ENABLED            | `false`                        | Enable prompt sharing between users. Only admin users are allowed to modify public folders. Add admins by setting db collection field `users.role` to `admin` for each individual user.   |
| DEFAULT_USER_LIMIT_USD_MONTHLY    |                                | Requires API pricing to be configured. Set a default monthly limit on api consumption per user. Leave unset for unrestricted access       |

If you do not provide an OpenAI API key with `OPENAI_API_KEY`, users will have to provide their own key.
If you don't have an OpenAI API key, you can get one [here](https://platform.openai.com/account/api-keys).

### API Pricing Configuration
In order to track the consumption of the OpenAI API in USD, it is necessary to configure the current pricing rates for the API. This can be accomplished by updating the `llmPriceRate` collection in MongoDB and adjusting the values for `promptPriceUSDPer1000` and `completionPriceUSDPer1000` for each model.

Here is an example document for the gpt-3.5-turbo model:
```
{
    modelId: "gpt-3.5-turbo",
    promptPriceUSDPer1000: 0.0015,
    completionPriceUSDPer1000: 0.002  
}
```
To identify the model IDs available, you can refer to the `/types/openai.ts` file.
By updating the pricing rates in this manner, you can ensure accurate tracking of API consumption and associated costs in USD.

#### Initial Database Configuration
In the process of initializing MongoDB on Docker, it is possible to configure the API rate pricing by utilizing environment variables. These variables should be appropriately named, taking into account the specific model and the corresponding prompt or completion price. The prescribed format for naming these variables is as follows: `MODEL_PRICING_1000_${PROMPT || COMPLETION}_${MODEL_ID} = VALUE`

For instance, let's consider an example that demonstrates the configuration for the gpt-3.5-turbo model:
```
MODEL_PRICING_1000_PROMPT_gpt-3.5-turbo=0.002
MODEL_PRICING_1000_COMPLETION_gpt-3.5-turbo=0.002
```

### Monthly consumption limit
To set a monthly consumption limit for users, follow these steps:

- Set a general user monthly limit in USD by configuring the environment variable `DEFAULT_USER_LIMIT_USD_MONTHLY`.
- Alternatively, you can set a specific limit for individual users by modifying their respective records in the database. Set the value of `users.monthlyUSDConsumptionLimit` to the desired amount.

Per-user limit takes precedence over the general limit.

## Plugin Settings

### ChatGPT compatible plugin

You can add a ChatGPT compatible plugin to `urls` field in `plugins.json`.

### Internal Tools

You can control the tools you want to use with the environment variable `PLUGINS_INTERNAL`.

#### Supported Internal Tools

- wikipedia_search
- google_search
- python_interpreter

#### Python Interpreter

_Recommended for use with GPT-4_

To enable python interpreter, you need to specify [codeapi](https://github.com/dotneet/codeapi) endpoint to `PYTHON_INTERPRETER_BACKEND` in `.env.local` and add `python_interpreter` to PLUGINS_INTERNAL.

```bash
# ex.
PLUGINS_INTERNAL=wikipedia_search,google_search,python_interpreter
PYTHON_INTERPRETER_BACKEND=http://localhost:8080/api/run
```

[Contact Us](CONTACT.md)
