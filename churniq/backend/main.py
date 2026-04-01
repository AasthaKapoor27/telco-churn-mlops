from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Literal, Optional
import pickle
import pandas as pd
import numpy as np
import os
import logging

# ─────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# App initialisation
# ─────────────────────────────────────────────
app = FastAPI(
    title="Churn Prediction API",
    version="1.0.0",
    description="Predict telecom customer churn with ML-powered inference.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:80",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Model loading
# ─────────────────────────────────────────────
MODEL_PATH = os.getenv("MODEL_PATH", "model.pkl")
COLUMNS_PATH = os.getenv("COLUMNS_PATH", "columns.pkl")

model = None
feature_columns = None

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(COLUMNS_PATH, "rb") as f:
        feature_columns = pickle.load(f)
    logger.info(
        "Model loaded: %s | Features: %d",
        type(model).__name__,
        len(feature_columns),
    )
except FileNotFoundError as e:
    logger.warning(
        "Model file not found (%s). Running in mock (heuristic) mode.", e
    )
    model = None
    feature_columns = None
except Exception as e:
    logger.warning(
        "Failed to load model (%s). Running in mock (heuristic) mode.", e
    )
    model = None
    feature_columns = None


# ─────────────────────────────────────────────
# Pydantic schemas
# ─────────────────────────────────────────────
class CustomerInput(BaseModel):
    tenure: int = Field(..., ge=0, le=72)
    MonthlyCharges: float = Field(..., ge=0, le=200)
    Contract: Literal["Month-to-month", "One year", "Two year"]
    InternetService: Literal["DSL", "Fiber optic", "No"]
    PaymentMethod: Literal[
        "Electronic check",
        "Mailed check",
        "Bank transfer (automatic)",
        "Credit card (automatic)",
    ]
    SeniorCitizen: Literal[0, 1]
    Partner: Literal["Yes", "No"]
    Dependents: Literal["Yes", "No"]
    gender: Literal["Male", "Female"] = "Male"
    PhoneService: Literal["Yes", "No"] = "Yes"
    MultipleLines: Literal["Yes", "No", "No phone service"] = "No"
    OnlineSecurity: Literal["Yes", "No", "No internet service"] = "No"
    OnlineBackup: Literal["Yes", "No", "No internet service"] = "No"
    DeviceProtection: Literal["Yes", "No", "No internet service"] = "No"
    TechSupport: Literal["Yes", "No", "No internet service"] = "No"
    StreamingTV: Literal["Yes", "No", "No internet service"] = "No"
    StreamingMovies: Literal["Yes", "No", "No internet service"] = "No"
    PaperlessBilling: Literal["Yes", "No"] = "Yes"
    TotalCharges: Optional[float] = None

    @validator("TotalCharges", always=True, pre=True)
    @classmethod
    def set_total_charges(cls, v, values):
        if v is None or v == 0:
            tenure = values.get("tenure", 0)
            monthly = values.get("MonthlyCharges", 0.0)
            return float(tenure * monthly)
        return v


class PredictionResponse(BaseModel):
    churn: Literal["Yes", "No"]
    probability: float
    risk: Literal["Low", "Medium", "High"]
    confidence: str
    message: str


# ─────────────────────────────────────────────
# Helper functions
# ─────────────────────────────────────────────
def preprocess(data: CustomerInput) -> pd.DataFrame:
    raw = data.dict()
    df = pd.DataFrame([raw])
    df = pd.get_dummies(df)

    if feature_columns is not None:
        for col in feature_columns:
            if col not in df.columns:
                df[col] = 0
        extra = [c for c in df.columns if c not in feature_columns]
        if extra:
            df = df.drop(columns=extra)
        df = df[feature_columns]

    return df


def get_risk(probability: float) -> tuple:
    if probability > 0.7:
        return ("High", "Immediate retention action recommended.")
    elif probability > 0.4:
        return ("Medium", "Proactive engagement advised.")
    else:
        return ("Low", "Standard monitoring — customer appears stable.")


def mock_predict(data: CustomerInput) -> tuple:
    score = 0.0

    if data.Contract == "Month-to-month":
        score += 0.35
    elif data.Contract == "One year":
        score += 0.15

    if data.InternetService == "Fiber optic":
        score += 0.20

    if data.MonthlyCharges > 70:
        score += 0.15

    if data.tenure < 12:
        score += 0.20
    elif data.tenure > 36:
        score -= 0.15

    score = round(max(0.02, min(0.97, score)), 4)
    churn = "Yes" if score > 0.5 else "No"
    return (score, churn)


# ─────────────────────────────────────────────
# API routes
# ─────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "service": "Churn Prediction API",
        "version": "1.0.0",
        "model_loaded": model is not None,
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_ready": model is not None,
        "mode": "live" if model is not None else "mock",
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(data: CustomerInput):
    try:
        if model is not None:
            df = preprocess(data)
            probability = float(model.predict_proba(df)[0][1])
            churn = "Yes" if probability > 0.5 else "No"
        else:
            probability, churn = mock_predict(data)

        risk, message = get_risk(probability)

        return PredictionResponse(
            churn=churn,
            probability=round(probability, 4),
            risk=risk,
            confidence=f"{round(probability * 100, 1)}%",
            message=message,
        )
    except Exception as e:
        logger.error("Prediction error: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model/info")
def model_info():
    if model is None:
        return {"mode": "mock", "features": None}
    return {
        "mode": "live",
        "model_type": type(model).__name__,
        "features": feature_columns,
        "feature_count": len(feature_columns) if feature_columns else 0,
    }
