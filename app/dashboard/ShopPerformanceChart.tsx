"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockShops } from "@/mocks";

export const description = "An interactive pie chart";

const shopData = [
  { shop: "tech-gadgets", balance: 186, fill: "var(--color-tech-gadgets)" },
  {
    shop: "fashion-boutique",
    balance: 305,
    fill: "var(--color-fashion-boutique)",
  },
];

const chartConfig = {
  balance: {
    label: "Balance",
  },
  shop: {
    label: "Shop",
  },
  "tech-gadgets": {
    label: "Tech Gadgets Store",
    color: "var(--chart-1)",
  },
  "fashion-boutique": {
    label: "Fashion Boutique",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export default function ShopPerformanceChart() {
  const id = "pie-interactive";
  const [activeShop, setActiveShop] = React.useState(shopData[0].shop);

  const activeIndex = React.useMemo(
    () => shopData.findIndex((item) => item.shop === activeShop),
    [activeShop]
  );
  const shops = React.useMemo(() => shopData.map((item) => item.shop), []);

  return (
    <div className="flex flex-col h-full w-full">
      <ChartStyle id={id} config={chartConfig} />
      <div className="flex items-center">
        <Select value={activeShop} onValueChange={setActiveShop}>
          <SelectTrigger
            className="w-[150px] rounded-lg pl-2 text-xs shadow-none border-foreground/30 mt-8"
            aria-label="Select a shop"
          >
            <SelectValue placeholder="Select shop" />
          </SelectTrigger>
          <SelectContent
            align="end"
            className="rounded-xl bg-background border-foreground/30"
          >
            {shops.map((key) => {
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
                        backgroundColor: `var(--color-${key})`,
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
          className="aspect-square w-full max-w-[300px] h-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={shopData}
              dataKey="balance"
              nameKey="shop"
              innerRadius={80}
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
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
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
                          className="fill-foreground text-lg font-bold"
                        >
                          KES {shopData[activeIndex].balance.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 16}
                          className="fill-muted-foreground text-xs"
                        >
                          {
                            chartConfig[
                              shopData[activeIndex]
                                .shop as keyof typeof chartConfig
                            ]?.label
                          }
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
