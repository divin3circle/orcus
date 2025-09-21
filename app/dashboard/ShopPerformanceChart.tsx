"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
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

// Generate shop data dynamically from mockShops
const generateShopData = () => {
  return mockShops.map((shop, index) => ({
    shop: shop.id, // Use shop ID as unique identifier
    balance: (index + 1) * 150, // More balanced values: 150, 300, 450, etc.
    fill: `var(--chart-${(index % 5) + 1})`, // Use same color system as chartConfig
    name: shop.name, // Store shop name for display
  }));
};

// Generate chart config dynamically
const generateChartConfig = (shops: typeof mockShops) => {
  const baseConfig = {
    balance: {
      label: "Balance",
    },
    shop: {
      label: "Shop",
    },
  };

  // Add shop-specific configs
  const shopConfigs = shops.reduce((acc, shop, index) => {
    acc[shop.id] = {
      label: shop.name,
      color: `var(--chart-${(index % 5) + 1})`,
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return { ...baseConfig, ...shopConfigs } satisfies ChartConfig;
};

export default function ShopPerformanceChart() {
  const id = "pie-interactive";

  // Generate data and config dynamically
  const shopData = React.useMemo(() => generateShopData(), []);
  const chartConfig = React.useMemo(() => generateChartConfig(mockShops), []);

  // Handle empty shops case
  const hasShops = shopData.length > 0;
  const [activeShop, setActiveShop] = React.useState(
    hasShops ? shopData[0].shop : ""
  );

  const activeIndex = React.useMemo(
    () => shopData.findIndex((item) => item.shop === activeShop),
    [activeShop, shopData]
  );
  const shops = React.useMemo(
    () => shopData.map((item) => item.shop),
    [shopData]
  );

  // Show "No Data" state when no shops exist
  if (!hasShops) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <h3 className="text-sm font-medium text-muted-foreground">
            No Shops Yet
          </h3>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Create your first shop to see performance data
          </p>
        </div>
      </div>
    );
  }

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

              if (!config || !("color" in config)) {
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
                        backgroundColor: config.color as string,
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
                          KES{" "}
                          {shopData[activeIndex]?.balance.toLocaleString() || 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 16}
                          className="fill-muted-foreground text-xs"
                        >
                          {chartConfig[
                            shopData[activeIndex]
                              ?.shop as keyof typeof chartConfig
                          ]?.label || "No Shop"}
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
