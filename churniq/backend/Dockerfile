# ─── Stage 1: builder ─────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder
WORKDIR /install
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --prefix=/install/packages --no-cache-dir -r requirements.txt

# ─── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /install/packages /usr/local
COPY main.py .
COPY requirements.txt .
COPY model.pkl* ./
COPY columns.pkl* ./
EXPOSE 8000
ENV MODEL_PATH=model.pkl \
    COLUMNS_PATH=columns.pkl \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
