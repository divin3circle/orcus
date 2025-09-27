"use client";
import { ChevronsLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TxnHeader from "./TxnHeader";
import { IconCopy } from "@tabler/icons-react";
import { formatCurrency, useTransactions } from "@/hooks/useTransactions";
import { formatBalance } from "@/hooks/useBalances";

function page() {
  const { data: transactions, isLoading, error } = useTransactions();
  if (isLoading) {
    return (
      <div className="">
        <TxnHeader />
        <div className="max-w-7xl mx-auto my-0 px-1">
          <Link href="/dashboard" className="flex items-center gap-1 my-4">
            <ChevronsLeft className="size-6" />
            <p className="underline underline-offset-4">Back Home</p>
          </Link>
          <p className="text-sm text-foreground/50">No transactions found</p>
        </div>
        <div className="flex items-center justify-center h-[45%]">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      </div>
    );
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (transactions?.length === 0 || !transactions) {
    return (
      <div className="">
        <TxnHeader />
        <div className="max-w-7xl mx-auto my-0 px-1">
          <Link href="/dashboard" className="flex items-center gap-1 my-4">
            <ChevronsLeft className="size-6" />
            <p className="underline underline-offset-4">Back Home</p>
          </Link>
          <p className="text-sm text-center text-foreground/50">
            No transactions found
          </p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <TxnHeader />
      <div className="max-w-7xl mx-auto my-0 px-1">
        <Link href="/dashboard" className="flex items-center gap-1 my-4">
          <ChevronsLeft className="size-6" />
          <p className="underline underline-offset-4">Back Home</p>
        </Link>
        <Table>
          <TableCaption>A list of your recent transactions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">TransactionID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Shop ID</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Fee</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                className="pb-4 hover:bg-foreground/5 transition-all duration-300 border-b-foreground/10"
              >
                <TableCell className="font-medium flex items-center gap-1">
                  {transaction.id.slice(0, 4)}...{transaction.id.slice(-4)}
                  <IconCopy className="size-4" />
                </TableCell>
                <TableCell>{transaction.status}</TableCell>
                <TableCell>
                  {transaction.shop_id.slice(0, 4)}...
                  {transaction.shop_id.slice(-4)}
                </TableCell>
                <TableCell className="text-right">
                  KES {formatBalance(transaction.amount)}
                </TableCell>
                <TableCell className="text-right">
                  KES {formatBalance(transaction.fee)}
                </TableCell>
                <TableCell className="text-right">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default page;
