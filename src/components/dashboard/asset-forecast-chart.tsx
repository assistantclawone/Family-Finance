'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { getDataForRegion } from '@/lib/data';
import { useRegion } from '@/contexts/region-context';

const chartConfig = {
  value: {
    label: 'Vermögen',
    color: 'hsl(var(--primary))',
  },
  income: {
    label: 'Einkommen',
    color: 'hsl(var(--chart-2))',
  },
  expenses: {
    label: 'Ausgaben',
    color: 'hsl(var(--destructive))',
  },
} satisfies ChartConfig;

export function AssetForecastChart() {
  const { region, currency, locale } = useRegion();
  const { forecastData } = getDataForRegion(region);

  const formatYAxis = (value: number) => {
    if (currency === 'CHF') {
       return `${Number(value) / 1000}k CHF`;
    }
    return `€${Number(value) / 1000}k`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vermögensprognose</CardTitle>
        <CardDescription>Prognostizierte Entwicklung Ihres Gesamtvermögens über die nächsten 6 Monate.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <AreaChart
              data={forecastData}
              margin={{
                top: 5,
                right: 10,
                left: -10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={80}
              />
              <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value) => 
                 new Intl.NumberFormat(locale, { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(Number(value))
              } />} />
              <Area
                dataKey="value"
                type="natural"
                fill="url(#fillValue)"
                stroke="hsl(var(--primary))"
                stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
