import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";

export default function VoidReportModal({ isOpen, onOpenChange }: any) {
  const [salesData, setSalesData] = useState<any>([]);
  const [groupedSalesList, setGroupedSalesList] = useState({});

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
  
    const fetchSalesData = async () => {
      try {
        const response = await fetch(
          "http://localhost/ororama/app/api/transactions.php?operation=getVoidReport"
        );
        const data = await response.json();
  
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];
  
        // Filter transactions made today
        const todaySalesData = data.filter((sale: any) => {
          const saleDate = sale.transaction_date.split(" ")[0];
          return saleDate === today;
        });
  
        const grouped = todaySalesData.reduce((acc: any, sale: any) => {
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
  
        setSalesData(todaySalesData);
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

  // useEffect(() => {
  //   if (isOpen) {
  //     fetchSalesData();
  //     intervalId = setInterval(fetchSalesData, 30000);
  //   } else {
  //     clearInterval(intervalId);
  //   }
  
  //   return () => clearInterval(intervalId);
  // }, [isOpen]);
  
  

  const getSalesTotal = () => {
    return salesData.reduce(
      (total: number, sale: any) => total + sale.transaction_totalAmount,
      0
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border border-primary sm:max-w-[1000px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
                Voided Transactions          
          </DialogTitle>
          <DialogDescription>
            {Object.keys(groupedSalesList).length > 0 ? (
              <Table>
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
                            </React.Fragment>
                          )
                        )}
                      </React.Fragment>
                    )
                  )}
                </TableBody>
                <TableCaption className="text-xl font-bold">
                  Overall Total Sales: ₱{getSalesTotal().toFixed(2)}
                </TableCaption>
              </Table>
            ) : (
              <p>No sales data available for today.</p>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
