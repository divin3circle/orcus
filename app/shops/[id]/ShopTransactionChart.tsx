"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useShopTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/hooks/useTransactions";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A bar chart";

const chartConfig = {
  transactions: {
    label: "Transactions",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface ShopTransactionChartProps {
  shopId: string;
}

export function ShopTransactionChart({ shopId }: ShopTransactionChartProps) {
  const { data: transactions, isLoading, error } = useShopTransactions(shopId);

  const getDailyTransactionData = () => {
    if (!transactions) return [];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    return last7Days.map((date) => {
      const dayTransactions = transactions.filter((txn) =>
        txn.created_at.startsWith(date)
      );

      const totalAmount = dayTransactions.reduce(
        (sum, txn) => sum + txn.amount,
        0
      );
      const transactionCount = dayTransactions.length;

      return {
        day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        date: date,
        transactions: transactionCount,
        amount: totalAmount,
      };
    });
  };

  const chartData = getDailyTransactionData();
  const totalTransactions = transactions?.length || 0;
  const totalAmount =
    transactions?.reduce((sum, txn) => sum + txn.amount, 0) || 0;

  if (isLoading) {
    return (
      <Card className="border border-foreground/30 rounded-3xl bg-transparent shadow-none w-full md:w-[60%]">
        <CardHeader>
          <CardTitle>Transaction Chart</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-muted-foreground">
              Loading transaction data...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-foreground/30 rounded-3xl bg-transparent shadow-none w-full md:w-[60%]">
        <CardHeader>
          <CardTitle>Transaction Chart</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="text-red-500">Failed to load transaction data</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-foreground/30 rounded-3xl bg-transparent shadow-none w-full md:w-[60%]">
      <CardHeader>
        <CardTitle>Transaction Chart</CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => [
                    name === "transactions"
                      ? `${value} transactions`
                      : formatCurrency(value as number),
                    name === "transactions" ? "Count" : "Amount",
                  ]}
                />
              }
            />
            <Bar
              dataKey="transactions"
              fill="var(--color-transactions)"
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {totalTransactions} total transactions{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Total amount: {formatCurrency(totalAmount)}
        </div>
      </CardFooter>
    </Card>
  );
}
