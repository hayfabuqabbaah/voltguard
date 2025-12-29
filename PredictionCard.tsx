import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

interface PredictionCardProps {
  powerQualityClass?: string;
  confidence?: number;
  isLoading?: boolean;
}

export default function PredictionCard({ 
  powerQualityClass = 'غير معروف', 
  confidence = 0,
  isLoading = false 
}: PredictionCardProps) {
  
  // تحديد اللون والأيقونة بناءً على فئة جودة الطاقة
  const getStatusInfo = (className: string) => {
    const lowerClass = className.toLowerCase();
    if (lowerClass.includes('جيد') || lowerClass.includes('good') || lowerClass === '0') {
      return {
        icon: CheckCircle2,
        color: '#00ff00',
        bgColor: 'rgba(0, 255, 0, 0.1)',
        borderColor: 'rgba(0, 255, 0, 0.3)',
        label: 'جودة ممتازة',
      };
    } else if (lowerClass.includes('متوسط') || lowerClass.includes('medium') || lowerClass === '1') {
      return {
        icon: AlertCircle,
        color: '#ffaa00',
        bgColor: 'rgba(255, 170, 0, 0.1)',
        borderColor: 'rgba(255, 170, 0, 0.3)',
        label: 'جودة متوسطة',
      };
    } else {
      return {
        icon: AlertTriangle,
        color: '#ff4444',
        bgColor: 'rgba(255, 68, 68, 0.1)',
        borderColor: 'rgba(255, 68, 68, 0.3)',
        label: 'جودة منخفضة',
      };
    }
  };

  const statusInfo = getStatusInfo(powerQualityClass);
  const IconComponent = statusInfo.icon;

  return (
    <div 
      className="rounded-lg p-6 backdrop-blur-md border shadow-2xl transition-all duration-300"
      style={{
        backgroundColor: statusInfo.bgColor,
        borderColor: statusInfo.borderColor,
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <IconComponent 
            size={32} 
            style={{ color: statusInfo.color }}
            className="animate-pulse"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-mono font-bold text-gray-300 mb-1">
            فئة جودة الطاقة
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-8 bg-gray-700/30 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-700/30 rounded w-3/4 animate-pulse"></div>
            </div>
          ) : (
            <>
              <p 
                className="text-2xl font-mono font-bold mb-2"
                style={{ color: statusInfo.color }}
              >
                {powerQualityClass}
              </p>
              <p className="text-xs text-gray-400 font-mono">
                {statusInfo.label}
              </p>
            </>
          )}
        </div>
      </div>

      {/* عرض نسبة الثقة */}
      <div className="mt-4 pt-4 border-t border-gray-600/30">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono text-gray-400">نسبة الثقة</span>
          <span 
            className="text-sm font-mono font-bold"
            style={{ color: statusInfo.color }}
          >
            {isLoading ? '--' : `${(confidence * 100).toFixed(2)}%`}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-700/30 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: isLoading ? '0%' : `${Math.min(confidence * 100, 100)}%`,
              backgroundColor: statusInfo.color,
              boxShadow: `0 0 10px ${statusInfo.color}`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
