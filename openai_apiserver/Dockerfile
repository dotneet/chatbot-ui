FROM python:3.10

WORKDIR /code

COPY ./openai_apiserver/requirements.txt /tmp/requirements.txt

RUN pip install -r /tmp/requirements.txt

COPY ./openai_apiserver /code/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]