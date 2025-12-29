import { useState, useCallback } from 'react';
import { Zap, Activity, UploadCloud, AlertTriangle, Loader2 } from 'lucide-react';
import InputGrid from '@/components/InputGrid';
import WaveformChart from '@/components/WaveformChart';
import PredictionCard from '@/components/PredictionCard';

const TOTAL_POINTS = 128;
const API_URL = 'http://127.0.0.1:8000';

export default function Home() {
  const [inputValues, setInputValues] = useState<number[]>(Array(TOTAL_POINTS).fill(0));
  const [prediction, setPrediction] = useState<{ class: string; confidence: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // توليد عينة عشوائية
  const generateRandomSample = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/generate_test`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('فشل في توليد العينة العشوائية');
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data.length === TOTAL_POINTS) {
        setInputValues(data);
      } else if (data.data && Array.isArray(data.data)) {
        setInputValues(data.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(message);
      console.error('Error generating sample:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // تحليل شكل الموجة والتنبؤ
  const analyzeWaveform = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      setPrediction(null);

      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputValues),
      });

      if (!response.ok) {
        throw new Error('فشل في التنبؤ');
      }

      const data = await response.json();
      
      // معالجة الاستجابة
      if (data.prediction !== undefined && data.confidence !== undefined) {
        setPrediction({
          class: String(data.prediction),
          confidence: data.confidence,
        });
      } else if (data.class !== undefined && data.confidence !== undefined) {
        setPrediction({
          class: data.class,
          confidence: data.confidence,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(message);
      console.error('Error analyzing waveform:', err);
    } finally {
      setIsLoading(false);
    }
  }, [inputValues]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
      {/* الخلفية المتحركة */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* الرأس */}
        <header className="border-b border-amber-500/20 backdrop-blur-md bg-blue-950/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-8 h-8 text-amber-500" />
              <h1 className="text-3xl font-mono font-bold text-amber-500">
                VoltGuard
              </h1>
            </div>
            <p className="text-gray-400 text-sm font-mono">
              محلل جودة الطاقة المدعوم بالذكاء الاصطناعي
            </p>
          </div>
        </header>

        {/* المحتوى الرئيسي */}
        <main className="flex-1 container mx-auto px-4 py-8">
          {/* رسالة الخطأ */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-500 font-mono font-bold text-sm">خطأ</h3>
                <p className="text-red-400 text-sm font-mono">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* العمود الأيسر - الإدخال */}
            <div className="lg:col-span-2 space-y-6">
              {/* قسم الإدخال */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-mono font-bold text-amber-500">
                    إدخال البيانات (128 نقطة)
                  </h2>
                </div>
                <InputGrid 
                  values={inputValues} 
                  onChange={setInputValues}
                  isLoading={isLoading}
                />
              </section>

              {/* الأزرار */}
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={generateRandomSample}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-blue-950 font-mono font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-amber-500/50 hover:shadow-2xl transform hover:scale-105"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  عينة عشوائية
                </button>

                <button
                  onClick={analyzeWaveform}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-blue-950 font-mono font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-amber-500/50 hover:shadow-2xl transform hover:scale-105"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  تحليل شكل الموجة
                </button>
              </div>

              {/* المخطط */}
              <section>
                <WaveformChart data={inputValues} />
              </section>
            </div>

            {/* العمود الأيمن - النتائج */}
            <div className="lg:col-span-1">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-mono font-bold text-amber-500">
                    النتائج
                  </h2>
                </div>
                <PredictionCard 
                  powerQualityClass={prediction?.class || 'انتظر التحليل'}
                  confidence={prediction?.confidence || 0}
                  isLoading={isLoading}
                />

                {/* معلومات إضافية */}
                <div className="mt-6 bg-gradient-to-br from-blue-900/20 to-blue-800/10 backdrop-blur-md rounded-lg p-4 border border-amber-500/30">
                  <h3 className="text-sm font-mono font-bold text-amber-500 mb-3">
                    معلومات النظام
                  </h3>
                  <div className="space-y-2 text-xs font-mono text-gray-400">
                    <div className="flex justify-between">
                      <span>نقاط البيانات:</span>
                      <span className="text-amber-500">{TOTAL_POINTS}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>حالة الاتصال:</span>
                      <span className="text-green-400">متصل</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الإصدار:</span>
                      <span className="text-amber-500">1.0.0</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* التذييل */}
        <footer className="border-t border-amber-500/20 backdrop-blur-md bg-blue-950/30 mt-12">
          <div className="container mx-auto px-4 py-6 text-center">
            <p className="text-gray-500 text-xs font-mono">
              VoltGuard © 2025 | تحليل جودة الطاقة المتقدم
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
