"""A server that provides OpenAI-compatible RESTful APIs. It supports:

- Chat Completions. (Reference: https://platform.openai.com/docs/api-reference/chat)
- Completions. (Reference: https://platform.openai.com/docs/api-reference/completions)
- Embeddings. (Reference: https://platform.openai.com/docs/api-reference/embeddings)

Usage:
python3 -m fastchat.serve.openai_api_server
"""
import asyncio
import argparse
import json
import logging
from typing import Generator, Optional, List, Any

import fastapi
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security.http import HTTPBearer
from pydantic import BaseSettings
import shortuuid
import uvicorn

from app.openai_api_protocol import (
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatCompletionResponseStreamChoice,
    ChatCompletionStreamResponse,
    ChatMessage,
    ChatCompletionResponseChoice,
    CompletionRequest,
    CompletionResponse,
    CompletionResponseChoice,
    DeltaMessage,
    CompletionResponseStreamChoice,
    CompletionStreamResponse,
    EmbeddingsRequest,
    EmbeddingsResponse,
    ModelCard,
    ModelList,
    ModelPermission,
    UsageInfo,
)

logger = logging.getLogger(__name__)

conv_template_map = {}


class AppSettings(BaseSettings):
    # The address of the model controller.
    controller_address: str = "http://localhost:21001"
    api_keys: Optional[List[str]] = None


app_settings = AppSettings()
app = fastapi.FastAPI()
headers = {"User-Agent": "FastChat API Server"}
get_bearer_token = HTTPBearer(auto_error=False)


@app.get("/v1/models", response_model=ModelList)
async def show_available_models():
    model_cards = []
    for model in ["vicuna-13b-hf", "wizard-vicuna-13b-hf"]:
        model_cards.append(ModelCard(id=model, permission=[ModelPermission()]))
    return ModelList(data=model_cards)
        
async def chat_completion_stream_generator(
    model_name: str, n: int
) -> Generator[str, Any, None]:
    """
    Event stream format:
    https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format
    """
    return_str = """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."""
    id = f"chatcmpl-{shortuuid.random()}"
    for i in range(n):
        # First chunk with role
        choice_data = ChatCompletionResponseStreamChoice(
            index=i,
            delta=DeltaMessage(role="assistant"),
            finish_reason=None,
        )
        chunk = ChatCompletionStreamResponse(
            id=id, choices=[choice_data], model=model_name
        )
        yield f"data: {chunk.json(exclude_unset=True, ensure_ascii=False)}\n\n"

        previous_text = ""
        for word in return_str.split(" "):
            await asyncio.sleep(0.1)
            choice_data = ChatCompletionResponseStreamChoice(
                index=i,
                delta=DeltaMessage(content=f"{word} "),
                finish_reason=None,
            )
            chunk = ChatCompletionStreamResponse(
                id=id, choices=[choice_data], model=model_name
            )
            yield f"data: {chunk.json(exclude_unset=True, ensure_ascii=False)}\n\n"

        choice_data = ChatCompletionResponseStreamChoice(
            index=i,
            delta={},
            finish_reason="stop",
        )
        chunk = ChatCompletionStreamResponse(
            id=id, choices=[choice_data], model=model_name
        )
        yield f"data: {chunk.json(exclude_unset=True, ensure_ascii=False)}\n\n"
    yield "data: [DONE]\n\n"

@app.post("/v1/chat/completions")
async def create_chat_completion(request: ChatCompletionRequest):
    """Creates a completion for the chat message"""
    if request.stream:
        generator = chat_completion_stream_generator(request.model, request.n)
        return StreamingResponse(generator, media_type="text/event-stream")

    choices = []
    response = "This is a dummy response from the API"
    usage = UsageInfo()
    for i in range(request.n):
        choices.append(
            ChatCompletionResponseChoice(
                index=i,
                message=ChatMessage(role="assistant", content=response),
                finish_reason="stop",
            )
        )

    return ChatCompletionResponse(model=request.model, choices=choices, usage=usage)


async def generate_completion_stream_generator(request: CompletionRequest, n: int):
    return_str = """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."""
    model_name = request.model
    id = f"cmpl-{shortuuid.random()}"
    finish_stream_events = []
    if not isinstance(request.prompt, list):
        request.prompt = [request.prompt]
    for text in request.prompt:
        for i in range(n):
            for word in return_str.split(" "):
                await asyncio.sleep(0.1)
                choice_data = CompletionResponseStreamChoice(
                    index=i,
                    text=f"{word} ",
                    logprobs=None,
                    finish_reason=None,
                )
                chunk = CompletionStreamResponse(
                    id=id,
                    object="text_completion",
                    choices=[choice_data],
                    model=model_name,
                )
                yield f"data: {chunk.json(exclude_unset=True, ensure_ascii=False)}\n\n"
            choice_data = CompletionResponseStreamChoice(
                index=i,
                text=" ",
                logprobs=None,
                finish_reason="stop",
            )
            chunk = CompletionStreamResponse(
                id=id,
                object="text_completion",
                choices=[choice_data],
                model=model_name,
            )
            yield f"data: {chunk.json(exclude_unset=True, ensure_ascii=False)}\n\n"
    yield "data: [DONE]\n\n"


@app.post("/v1/completions")
async def create_completion(request: CompletionRequest):
    if request.stream:
        generator = generate_completion_stream_generator(request, request.n)
        return StreamingResponse(generator, media_type="text/event-stream")
    else:
        choices = []
        usage = UsageInfo()
        if not isinstance(request.prompt, List):
            request.prompt = [request.prompt]
        idx = 0
        for i in range(request.n):
            for j, _ in enumerate(request.prompt):
                choices.append(
                    CompletionResponseChoice(
                        index=idx,
                        text="this is a dummy response from the non-existent model API",
                        logprobs=None,
                        finish_reason="stop",
                    )
                )
                idx += 1
        return CompletionResponse(
            model=request.model, choices=choices, usage=UsageInfo.parse_obj(usage)
        )


@app.post("/v1/embeddings")
@app.post("/v1/engines/{model_name}/embeddings")
async def create_embeddings(request: EmbeddingsRequest, model_name: str = None):
    import random
    """Creates embeddings for the text"""
    if request.model is None:
        request.model = model_name
    data = []

    if not isinstance(request.input, List):
        request.input = [request.input]
    for i, sentence in enumerate(request.input):
        data += [
            {
                "object": "embedding",
                "embedding": [random.random() for _ in range(384)],
                "index": i,
            }
        ]
    return EmbeddingsResponse(
        data=data,
        model=request.model,
        usage=UsageInfo(
            prompt_tokens=0,
            total_tokens=0,
            completion_tokens=None,
        ),
    ).dict(exclude_none=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="FastChat ChatGPT-Compatible RESTful API server."
    )
    parser.add_argument("--host", type=str, default="localhost", help="host name")
    parser.add_argument("--port", type=int, default=8000, help="port number")
    parser.add_argument(
        "--controller-address", type=str, default="http://localhost:21001"
    )
    parser.add_argument(
        "--allow-credentials", action="store_true", help="allow credentials"
    )
    parser.add_argument(
        "--allowed-origins", type=json.loads, default=["*"], help="allowed origins"
    )
    parser.add_argument(
        "--allowed-methods", type=json.loads, default=["*"], help="allowed methods"
    )
    parser.add_argument(
        "--allowed-headers", type=json.loads, default=["*"], help="allowed headers"
    )
    parser.add_argument(
        "--api-keys",
        type=lambda s: s.split(","),
        help="Optional list of comma separated API keys",
    )
    args = parser.parse_args()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=args.allowed_origins,
        allow_credentials=args.allow_credentials,
        allow_methods=args.allowed_methods,
        allow_headers=args.allowed_headers,
    )
    app_settings.controller_address = args.controller_address
    app_settings.api_keys = args.api_keys

    logger.info(f"args: {args}")

    uvicorn.run("main:app", host=args.host, port=args.port, log_level="info", reload=True)
    # uvicorn.run(app, host=args.host, port=args.port, log_level="info")
