import React from 'react';
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
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function SuspendedList({ isOpen, onOpenChange, suspendedList, resumeTransaction }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border sm:max-w-[700px] border-primary">
        <DialogHeader>
          <DialogTitle>Suspended Transactions</DialogTitle>
          <DialogDescription>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className='text-center'>Order List</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suspendedList.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>₱{transaction.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transaction.orderList.map((item: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{item.product}</TableCell>
                              <TableCell>{item.qty}</TableCell>
                              <TableCell>₱{item.price.toFixed(2)}</TableCell>
                              <TableCell>₱{(item.qty * item.price).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableCell>
                    <TableCell>
                      <Button variant="link" onClick={() => resumeTransaction(transaction)}>
                        Resume
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
