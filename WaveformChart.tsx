import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WaveformChartProps {
  data: number[];
}

export default function WaveformChart({ data }: WaveformChartProps) {
  // تحويل البيانات إلى صيغة Recharts
  const chartData = data.map((value, index) => ({
    index,
    value: Number(value.toFixed(4)),
  }));

  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 backdrop-blur-md rounded-lg p-6 border border-amber-500/30 shadow-2xl">
      <h3 className="text-lg font-mono font-bold text-amber-500 mb-4">تصور شكل الموجة</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(240, 165, 0, 0.1)" />
          <XAxis 
            dataKey="index" 
            stroke="#b0b0b0"
            style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            tick={{ fill: '#b0b0b0' }}
          />
          <YAxis 
            stroke="#b0b0b0"
            style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            tick={{ fill: '#b0b0b0' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(10, 42, 79, 0.9)',
              border: '1px solid #f0a500',
              borderRadius: '8px',
              fontFamily: 'JetBrains Mono',
              color: '#ffffff',
            }}
            formatter={(value) => [
              typeof value === 'number' ? value.toFixed(4) : value,
              'القيمة'
            ]}
            labelStyle={{ color: '#f0a500', fontWeight: 'bold' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#f0a500"
            dot={false}
            strokeWidth={2}
            isAnimationActive={true}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
