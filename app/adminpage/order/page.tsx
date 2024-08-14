'use client';
import React, { useState, useEffect } from "react";
import axios from 'axios';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

import SideBar from "@/components/sideBar/sidebar";

export default function AdminPage() {

  const [salesData, setSalesData] = useState<any>([]);
  const [voidSalesData, setVoidSalesData] = useState<any>([]);
  const [recentSale, setRecentSale] = useState<any>([]);
  const [groupedSalesList, setGroupedSalesList] = useState({});
  const [groupedVoidSales, setGroupedVoidSales] = useState({});
  const [countCompletedTransactions, setCountCompletedTransactions] = useState<number>(0);
  const [countVoidTransactions, setCountVoidTransactions] = useState<number>(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
  
    const fetchSalesData = async () => {
      try {
        const response = await fetch(
          "http://localhost/ororama/app/api/transactions.php?operation=getSalesReport"
        );
        const data = await response.json();
  
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];
  
        // // Filter transactions made today
        // const todaySalesData = data.filter((sale: any) => {
        //   const saleDate = sale.transaction_date.split(" ")[0];
        //   return saleDate === today;
        // });
  
        const grouped = data.reduce((acc: any, sale: any) => {
          if (!acc[sale.user_fullname]) {
            acc[sale.user_fullname] = {};
          }
          if (!acc[sale.user_fullname][sale.transaction_id]) {
            acc[sale.user_fullname][sale.transaction_id] = {
              total: sale.transaction_totalAmount,
              items: [],
            };
          }
          acc[sale.user_fullname][sale.transaction_id].items.push(sale);
          return acc;
        }, {});
  
        setSalesData(data);
        setGroupedSalesList(grouped);

      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };
  
    fetchSalesData(); // Initial fetch when the component mounts
  
    // Polling: Fetch data every 30 seconds
    intervalId = setInterval(fetchSalesData, 5000);
  
    return () => {
      clearInterval(intervalId); // Clean up the interval on component unmount
    };
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
  
    const fetchVoidSalesData = async () => {
      try {
        const response = await fetch(
          "http://localhost/ororama/app/api/transactions.php?operation=getVoidReport"
        );
        const data = await response.json();
  
  
        const grouped = data.reduce((acc: any, sale: any) => {
          if (!acc[sale.user_fullname]) {
            acc[sale.user_fullname] = {};
          }
          if (!acc[sale.user_fullname][sale.transaction_id]) {
            acc[sale.user_fullname][sale.transaction_id] = {
              total: sale.transaction_totalAmount,
              items: [],
            };
          }
          acc[sale.user_fullname][sale.transaction_id].items.push(sale);
          return acc;
        }, {});
  
        setVoidSalesData(data);
        setGroupedVoidSales(grouped);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };
  
    fetchVoidSalesData(); // Initial fetch when the component mounts
  
    // Polling: Fetch data every 30 seconds
    intervalId = setInterval(fetchVoidSalesData, 5000);
  
    return () => {
      clearInterval(intervalId); // Clean up the interval on component unmount
    };
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
  
    const fetchRecentSale = async () => {
      try {
        const response = await fetch(
          "http://localhost/ororama/app/api/transactions.php?operation=getMostRecentSale"
        );
        const data = await response.json();
  
        const today = new Date().toISOString().split("T")[0];
        console.log(data)
        setRecentSale(data);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };
  
    fetchRecentSale(); // Initial fetch when the component mounts
  
    // Polling: Fetch data every 30 seconds
    intervalId = setInterval(fetchRecentSale, 5000);
  
    return () => {
      clearInterval(intervalId); // Clean up the interval on component unmount
    };
  }, []);
  
  const getSalesTotal = () => {
    return salesData.reduce(
      (total: number, sale: any) => total + sale.transaction_totalAmount,
      0
    );
  };

  const fetchCompletedTransactionsCount = async () => {
    try {
      const response = await axios.get('http://localhost/ororama/app/api/transactions.php', {
        params: {
          operation: 'countCompletedTransactions'
        }
      });
      const transactionNum = response.data[0]?.transactionNum || 0;
      setCountCompletedTransactions(transactionNum); // Update state with the latest count
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchVoidTransactionsCount = async () => {
    try {
      const response = await axios.get('http://localhost/ororama/app/api/transactions.php', {
        params: {
          operation: 'countVoidTransactions'
        }
      });
      const transactionNum = response.data[0]?.transactionNum || 0;
      setCountVoidTransactions(transactionNum); // Update state with the latest count
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };
  
  // Fetch product count on component mount
  useEffect(() => {
    fetchCompletedTransactionsCount();
  
    // Polling every 30 seconds (30000 ms)
    const intervalId = setInterval(fetchCompletedTransactionsCount, 5000);
  
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchVoidTransactionsCount();
  
    // Polling every 30 seconds (30000 ms)
    const intervalId = setInterval(fetchVoidTransactionsCount, 5000);
  
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <SideBar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="flex gap-x-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Overall Total Sales:</CardDescription>
                  <CardTitle className="text-4xl">₱{getSalesTotal().toFixed(2)}</CardTitle>
                </CardHeader>
                <CardFooter></CardFooter>
              </Card>
              <Card className="w-[350px]">
                <CardHeader className="pb-2">
                  <CardDescription>Total # of Completed Transactions:</CardDescription>
                  <CardTitle className="text-4xl">{countCompletedTransactions} Transactions</CardTitle>
                </CardHeader>
                <CardFooter></CardFooter>
              </Card>
              <Card className="w-[350px]">
                <CardHeader className="pb-2">
                  <CardDescription>Total # of Void Transactions:</CardDescription>
                  <CardTitle className="text-4xl">{countVoidTransactions} Transactions</CardTitle>
                </CardHeader>
                <CardFooter></CardFooter>
              </Card>
            </div>
            <div>
            <Tabs defaultValue="completed">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="void">Void</TabsTrigger>
              </TabsList>
              </div>
            <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>List of Completed Transactions</CardTitle>
                <CardDescription>List of the sales completed.</CardDescription>
              </CardHeader>
              <CardContent>
              {Object.keys(groupedSalesList).length > 0 ? (
              <Table>
                <ScrollArea className="h-[450px] rounded-md border p-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Cashier</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date & Time of Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                
                  {Object.entries(groupedSalesList).map(
                    ([user_fullname, transactions]: any, index: number) => (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell colSpan={6} className="font-bold">
                            {user_fullname}
                          </TableCell>
                        </TableRow>
                        {Object.entries(transactions).map(
                          ([transaction_id, transactionData]: any, transactionIndex: number) => (
                            <React.Fragment key={transactionIndex}>
                              {transactionData.items.map(
                                (sale: any, saleIndex: number) => (
                                  <TableRow key={saleIndex}>
                                    {saleIndex === 0 && (
                                      <TableCell
                                        rowSpan={transactionData.items.length}
                                        className="font-bold"
                                      >{`Transaction ID: ${transaction_id}`}</TableCell>
                                    )}
                                    <TableCell>{sale.order_qty}</TableCell>
                                    <TableCell>{sale.product_name}</TableCell>
                                    <TableCell>
                                      ₱{sale.product_price.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      ₱{sale.order_amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      {new Date(
                                        sale.transaction_date
                                      ).toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                              <TableRow className="mb-2">
                                <TableCell
                                  colSpan={6}
                                  className="text-right font-bold"
                                >
                                  Total for Transaction: ₱
                                  {transactionData.total.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          )
                        )}
                      </React.Fragment>
                    )
                  )}
                </TableBody>
                </ScrollArea>
                <TableCaption className="text-xl font-bold">
                  
                </TableCaption>
              </Table>
            ) : (
              <p>No sales data available for today.</p>
            )}
              </CardContent>
            </Card>
            </TabsContent>
            <TabsContent value="void">
            <Card>
              <CardHeader>
                <CardTitle>List of Void Transactions</CardTitle>
                <CardDescription>List of the sales voided.</CardDescription>
              </CardHeader>
              <CardContent>
              {Object.keys(groupedVoidSales).length > 0 ? (
              <Table>
                <ScrollArea className="h-[450px] rounded-md border p-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Cashier</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date & Time of Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedVoidSales).map(
                    ([user_fullname, transactions]: any, index: number) => (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell colSpan={6} className="font-bold">
                            {user_fullname}
                          </TableCell>
                        </TableRow>
                        {Object.entries(transactions).map(
                          ([transaction_id, transactionData]: any, transactionIndex: number) => (
                            <React.Fragment key={transactionIndex}>
                              {transactionData.items.map(
                                (sale: any, saleIndex: number) => (
                                  <TableRow key={saleIndex}>
                                    {saleIndex === 0 && (
                                      <TableCell
                                        rowSpan={transactionData.items.length}
                                        className="font-bold"
                                      >{`Transaction ID: ${transaction_id}`}</TableCell>
                                    )}
                                    <TableCell>{sale.order_qty}</TableCell>
                                    <TableCell>{sale.product_name}</TableCell>
                                    <TableCell>
                                      ₱{sale.product_price.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      ₱{sale.order_amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      {new Date(
                                        sale.transaction_date
                                      ).toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                              <TableRow className="mb-2">
                                <TableCell
                                  colSpan={6}
                                  className="text-right font-bold"
                                >
                                  Total for Transaction: ₱
                                  {transactionData.total.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          )
                        )}
                      </React.Fragment>
                    )
                  )}
                </TableBody>
                </ScrollArea>
                <TableCaption className="text-xl font-bold">
                  
                </TableCaption>
              </Table>
            ) : (
              <p>No sales data available for today.</p>
            )}
              </CardContent>
            </Card>
            </TabsContent>
            </Tabs>
            </div>
          </div>
          <div className="mt-32">
            <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
              <CardHeader className="flex flex-row items-start bg-muted/50">
                <div className="grid gap-0.5">
                  <CardTitle className="group flex items-center gap-2 text-lg">
                    Recent Transaction
                  </CardTitle>
                  <CardDescription>
                    {recentSale && recentSale.products ? new Date(recentSale.transaction_date).toLocaleString() : 'No transactions'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-sm">
                <div className="grid gap-3">
                  {recentSale && recentSale.products ? (
                      <>
                          <div className="font-semibold">Order Details</div>
                          <ul className="grid gap-3">
                              {recentSale.products.map((item: any) => (
                                  <li key={item.product_name} className="flex items-center justify-between">
                                      <span className="text-muted-foreground">
                                          {item.product_name} x <span>{item.order_qty}</span>
                                      </span>
                                      <span>₱{item.product_price * item.order_qty}</span>
                                  </li>
                              ))}
                          </ul>
                          <Separator className="my-2" />
                          <ul className="grid gap-3">
                              <li className="flex items-center justify-between font-semibold">
                                  <span className="text-muted-foreground">Total</span>
                                  <span>₱{recentSale.transaction_totalAmount}</span>
                              </li>
                          </ul>
                      </>
                  ) : (
                      <p>No order details available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}