FROM public.ecr.aws/lambda/python:3.12

# Install all dependencies
RUN pip install --no-cache-dir \
    langchain \
    langchain-community \
    langchain-openai \
    faiss-cpu \
    pypdf \
    openai \
    pdfplumber

# Copy your function code
COPY lambda_function.py ${LAMBDA_TASK_ROOT}/
COPY complete_auto_refresh_auth.py ${LAMBDA_TASK_ROOT}/

# Set handler
CMD ["lambda_function.lambda_handler"]