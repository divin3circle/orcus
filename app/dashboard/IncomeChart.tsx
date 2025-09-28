"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompletedTransactions } from "@/hooks/useTransactions";
import { Loader2 } from "lucide-react";

export const description = "An interactive daily income pie chart";

const chartConfig = {
  sunday: { label: "Sunday", color: "#FF8C00" }, // Orange
  monday: { label: "Monday", color: "#FF69B4" }, // Pink
  tuesday: { label: "Tuesday", color: "#FFD700" }, // Yellow
  wednesday: { label: "Wednesday", color: "#32CD32" }, // Green
  thursday: { label: "Thursday", color: "#000000" }, // Black
  friday: { label: "Friday", color: "#4169E1" }, // Blue
  saturday: { label: "Saturday", color: "#DC143C" }, // Red
} satisfies ChartConfig;

const getDayName = (date: string): string => {
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayIndex = new Date(date).getDay();
  return dayNames[dayIndex] || "unknown";
};

const groupTransactionsByDay = (transactions: any[]) => {
  const dailyData: { [key: string]: number } = {};

  transactions.forEach((transaction) => {
    const day = getDayName(transaction.created_at);
    if (!dailyData[day]) {
      dailyData[day] = 0;
    }
    dailyData[day] += transaction.amount;
  });

  const dayOrder = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return dayOrder
    .filter((day) => dailyData[day] > 0)
    .map((day) => ({
      day,
      income: dailyData[day],
      fill: chartConfig[day as keyof typeof chartConfig].color,
    }));
};

export default function IncomeChart() {
  const id = "pie-interactive";
  const { data: transactions, isLoading, error } = useCompletedTransactions();

  const chartData = React.useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    return groupTransactionsByDay(transactions);
  }, [transactions]);

  const [activeDay, setActiveDay] = React.useState(
    chartData.length > 0 ? chartData[0].day : "sunday"
  );
  React.useEffect(() => {
    if (
      chartData.length > 0 &&
      !chartData.find((item) => item.day === activeDay)
    ) {
      setActiveDay(chartData[0].day);
    }
  }, [chartData, activeDay]);

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.day === activeDay),
    [activeDay, chartData]
  );

  const days = React.useMemo(
    () => chartData.map((item) => item.day),
    [chartData]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[160px]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[160px] text-sm text-muted-foreground">
        Error loading chart data
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[160px] text-sm text-muted-foreground">
        No income data available
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <div className="flex items-center justify-between">
        <Select value={activeDay} onValueChange={setActiveDay}>
          <SelectTrigger
            className="w-[150px] rounded-lg pl-2 text-xs shadow-none border-foreground/30"
            aria-label="Select a day"
          >
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent
            align="end"
            className="rounded-xl bg-background border-foreground/30"
          >
            {days.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];

              if (!config) {
                return null;
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: config.color,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="aspect-square w-full max-w-[200px] h-[160px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  const formattedValue = (
                    (data.value as number) / 100
                  ).toLocaleString("en-KE", {
                    style: "currency",
                    currency: "KES",
                    minimumFractionDigits: 0,
                  });

                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {chartConfig[
                              data.payload.day as keyof typeof chartConfig
                            ]?.label || data.payload.day}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {formattedValue}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              dataKey="income"
              nameKey="day"
              innerRadius={40}
              strokeWidth={3}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 8} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 15}
                    innerRadius={outerRadius + 10}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (
                    viewBox &&
                    "cx" in viewBox &&
                    "cy" in viewBox &&
                    chartData[activeIndex]
                  ) {
                    const activeData = chartData[activeIndex];
                    const formattedAmount = (
                      activeData.income / 100
                    ).toLocaleString("en-KE", {
                      style: "currency",
                      currency: "KES",
                      minimumFractionDigits: 0,
                    });

                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-sm font-bold"
                        >
                          {formattedAmount}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 16}
                          className="fill-muted-foreground text-xs"
                        >
                          {chartConfig[
                            activeData.day as keyof typeof chartConfig
                          ]?.label || activeData.day}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
}
