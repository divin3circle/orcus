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
import { useShopPerformance, formatCurrency } from "@/hooks/useTransactions";
import { Loader2 } from "lucide-react";

export const description = "An interactive shop performance pie chart";

// Generate chart config dynamically from shop performance data
const generateChartConfig = (shopPerformance: any[]) => {
  const baseConfig = {
    earnings: {
      label: "Earnings",
    },
    shop: {
      label: "Shop",
    },
  };

  // Add shop-specific configs
  const shopConfigs = shopPerformance.reduce((acc, shop) => {
    acc[shop.id] = {
      label: shop.name,
      color: shop.fill,
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return { ...baseConfig, ...shopConfigs } satisfies ChartConfig;
};

export default function ShopPerformanceChart() {
  const id = "pie-interactive";
  const { data: shopPerformance, isLoading, error } = useShopPerformance();

  const shopData = React.useMemo(() => {
    if (!shopPerformance || shopPerformance.length === 0) {
      return [];
    }
    return shopPerformance.map((shop) => ({
      shop: shop.id,
      earnings: shop.totalEarnings,
      fill: shop.fill,
      name: shop.name,
    }));
  }, [shopPerformance]);

  const chartConfig = React.useMemo(
    () => generateChartConfig(shopPerformance || []),
    [shopPerformance]
  );

  const hasShops = shopData.length > 0;
  const [activeShop, setActiveShop] = React.useState(
    hasShops ? shopData[0]?.shop || "" : ""
  );

  const activeIndex = React.useMemo(
    () => shopData.findIndex((item) => item.shop === activeShop),
    [activeShop, shopData]
  );

  const shops = React.useMemo(
    () => shopData.map((item) => item.shop),
    [shopData]
  );

  React.useEffect(() => {
    if (
      hasShops &&
      (!activeShop || !shopData.find((item) => item.shop === activeShop))
    ) {
      setActiveShop(shopData[0]?.shop || "");
    }
  }, [shopData, activeShop, hasShops]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-sm text-muted-foreground mt-2">
          Loading shop data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Error Loading Data
          </h3>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Unable to load shop performance data
          </p>
        </div>
      </div>
    );
  }

  if (!hasShops) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🏪</div>
          <h3 className="text-sm font-medium text-muted-foreground">
            No Shops
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
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  const shop = shopPerformance?.find(
                    (s) => s.id === data.payload.shop
                  );

                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {shop?.name || data.payload.shop}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {formatCurrency(data.value as number)}
                          </span>
                          <span className="text-xs text-muted-foreground/70">
                            {shop?.transactionCount || 0} transactions
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
              data={shopData}
              dataKey="earnings"
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
                          className="fill-foreground text-sm font-bold"
                        >
                          {formatCurrency(shopData[activeIndex]?.earnings)}
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
