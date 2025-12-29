#!/usr/bin/env python3
"""
خادم FastAPI لمحلل جودة الطاقة VoltGuard
يوفر نقاط نهاية للتنبؤ وتوليد العينات العشوائية
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import random
from typing import List

# إنشاء تطبيق FastAPI
app = FastAPI(
    title="VoltGuard API",
    description="API لمحلل جودة الطاقة المدعوم بالذكاء الاصطناعي",
    version="1.0.0"
)

# إضافة CORS middleware للسماح بالطلبات من الواجهة الأمامية
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # السماح من أي مصدر
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# نموذج الطلب للتنبؤ
class PredictionRequest(BaseModel):
    """نموذج طلب التنبؤ"""
    pass

# نموذج الاستجابة للتنبؤ
class PredictionResponse(BaseModel):
    """نموذج استجابة التنبؤ"""
    prediction: int
    confidence: float
    class_name: str

# محاكاة نموذج التعلم الآلي
class PowerQualityPredictor:
    """محاكاة نموذج التنبؤ بجودة الطاقة"""
    
    def __init__(self):
        self.class_names = {
            0: "جيد جداً",
            1: "جيد",
            2: "متوسط",
            3: "سيء"
        }
    
    def predict(self, data: List[float]) -> tuple:
        """
        التنبؤ بفئة جودة الطاقة
        
        Args:
            data: قائمة بـ 128 قيمة رقمية
            
        Returns:
            tuple: (فئة التنبؤ، نسبة الثقة)
        """
        if len(data) != 128:
            raise ValueError(f"يجب أن تحتوي البيانات على 128 نقطة، حصلنا على {len(data)}")
        
        # تحويل البيانات إلى numpy array
        data_array = np.array(data, dtype=np.float32)
        
        # حساب الإحصائيات
        mean = np.mean(data_array)
        std = np.std(data_array)
        max_val = np.max(data_array)
        min_val = np.min(data_array)
        
        # حساب THD (Total Harmonic Distortion) المحاكاة
        # في التطبيق الحقيقي، سيتم استخدام FFT
        thd = std / (mean + 1e-6)
        
        # تحديد الفئة بناءً على الإحصائيات
        if thd < 0.05 and abs(mean - 1.0) < 0.1:
            prediction = 0  # جيد جداً
            confidence = 0.95
        elif thd < 0.1 and abs(mean - 1.0) < 0.2:
            prediction = 1  # جيد
            confidence = 0.85
        elif thd < 0.2 and abs(mean - 1.0) < 0.3:
            prediction = 2  # متوسط
            confidence = 0.75
        else:
            prediction = 3  # سيء
            confidence = 0.70
        
        # إضافة بعض العشوائية للثقة
        confidence = min(0.99, max(0.5, confidence + random.uniform(-0.05, 0.05)))
        
        return prediction, confidence
    
    def generate_sample(self) -> List[float]:
        """توليد عينة عشوائية من البيانات"""
        # توليد موجة جيبية مع بعض الضوضاء
        t = np.linspace(0, 4 * np.pi, 128)
        signal = np.sin(t) + 0.1 * np.random.randn(128)
        
        # تطبيع البيانات
        signal = (signal - np.min(signal)) / (np.max(signal) - np.min(signal))
        
        return signal.tolist()

# إنشاء مثيل من المتنبئ
predictor = PowerQualityPredictor()

@app.get("/", tags=["Health"])
async def root():
    """نقطة النهاية الجذرية"""
    return {
        "message": "مرحباً بك في VoltGuard API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """فحص صحة الخادم"""
    return {
        "status": "healthy",
        "service": "VoltGuard Power Quality Analyzer"
    }

@app.post("/predict", tags=["Prediction"])
async def predict(data: List[float]):
    """
    التنبؤ بفئة جودة الطاقة
    
    Args:
        data: قائمة بـ 128 قيمة رقمية
        
    Returns:
        dict: فئة التنبؤ ونسبة الثقة
    """
    try:
        if not isinstance(data, list):
            raise ValueError("يجب أن تكون البيانات قائمة")
        
        if len(data) != 128:
            raise ValueError(f"يجب أن تحتوي البيانات على 128 نقطة، حصلنا على {len(data)}")
        
        # التنبؤ
        prediction, confidence = predictor.predict(data)
        
        return {
            "prediction": prediction,
            "confidence": float(confidence),
            "class_name": predictor.class_names[prediction],
            "message": "تم التنبؤ بنجاح"
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في الخادم: {str(e)}")

@app.post("/generate_test", tags=["Testing"])
async def generate_test():
    """
    توليد عينة عشوائية للاختبار
    
    Returns:
        list: 128 قيمة عشوائية
    """
    try:
        sample = predictor.generate_sample()
        return sample
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في الخادم: {str(e)}")

@app.post("/predict_sample", tags=["Prediction"])
async def predict_sample(data: List[float]):
    """
    التنبؤ بفئة جودة الطاقة (نقطة نهاية بديلة)
    
    Args:
        data: قائمة بـ 128 قيمة رقمية
        
    Returns:
        dict: فئة التنبؤ ونسبة الثقة
    """
    return await predict(data)

@app.get("/docs", tags=["Documentation"])
async def docs():
    """الوثائق التفاعلية"""
    return {"message": "تفضل بزيارة /docs للوثائق التفاعلية"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info"
    )
