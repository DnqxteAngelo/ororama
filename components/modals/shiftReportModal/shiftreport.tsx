import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import axios from 'axios';

export default function ShiftReportModal({ isOpen, onClose, cashierId, cashierName }: any) {
  const [filteredSales, setFilteredSales] = useState<any>([]);
  const [groupedSalesList, setGroupedSalesList] = useState({});
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchShiftReport = async () => {
    const data = {
      cashierId: cashierId
    }
    const formData = new FormData();
    formData.append('operation', 'getShiftReport');
    formData.append('json', JSON.stringify(data));

    try {
      const response = await axios({
        url: 'http://localhost/ororama/app/api/transactions.php',
        method: 'POST',
        data: formData
      })

      const today = new Date().toISOString().split("T")[0];

        // Filter transactions made today
        const todaySalesData = response.data.filter((sale: any) => {
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
      console.log(todaySalesData)
      setFilteredSales(todaySalesData);
      setGroupedSalesList(grouped);
  } catch (error) {
    alert("Error");
  };
  }

  const getSalesTotal = () => {
    return filteredSales.reduce(
      (total: number, sale: any) => total + sale.transaction_totalAmount,
      0
    );
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isOpen && cashierId) {
      // Fetch the shift report from the PHP backend
      fetchShiftReport();

      intervalId = setInterval(fetchShiftReport, 30000);
  
      return () => {
        clearInterval(intervalId); // Clean up the interval on component unmount
      };
    }
  }, [isOpen, cashierId, fetchShiftReport]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border border-primary sm:max-w-[1000px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shift Report - {cashierName}</DialogTitle>
        <DialogDescription>
        {Object.keys(groupedSalesList).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
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
                        {/* <TableRow>
                          <TableCell colSpan={6} className="font-bold">
                            {user_fullname}
                          </TableCell>
                        </TableRow> */}
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
