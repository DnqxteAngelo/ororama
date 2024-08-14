'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@uidotdev/usehooks';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';

import Image from 'next/image';
import BarcodeScanner from '@/components/barcodeScanner/scanner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import CashierLoginModal from '@/components/modals/cashierLoginModal/login';
import ShiftReportModal from '@/components/modals/shiftReportModal/shiftreport';
import SalesReportModal from '@/components/modals/salesReportModal/salesreport';
import SuspendedListModal from '@/components/modals/suspendedListModal/suspendedlist';
import SupervisorAuthModal from '@/components/modals/supervisorAuthModal/supervisorauth';
import VoidReportModal from '@/components/modals/voidReportModal/voidReport';

interface Product {
  product_id: number;
  product_barcode: string;
  product_name: string;
  product_price: number;
  product_stock: number; 
}

export default function CashierPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fullname = sessionStorage.fullname;
  const userId = sessionStorage.userId;

  useEffect(() => {
    // Redirect if sessionStorage values are missing
    if (!fullname || !userId) {
      router.push('/'); // Redirect to login page or any other page
    }
  }, [fullname, userId, router]);

  const [productList, setProductList] = useState<Product[]>([]);
  const [orderList, setOrderList] = useState<any[]>([]);
  const [suspendedTransactions, setSuspendedTransactions] = useState<any[]>([]);

  const [qty, setQty] = useState(1);
  const [barCode, setBarCode] = useState('');
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState(0);
  const [total, setTotal] = useState(0);
  const [cash, setCash] = useState(0);
  const [change, setChange] = useState(0);
  const [balance, setBalance] = useState(500);
  const [applyDiscount, setApplyDiscount] = useState(false)

  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isShiftReportOpen, setIsShiftReportOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuspendedListOpen, setIsSuspendedListOpen] = useState(false);
  const [isSuspendConfirmOpen, setIsSuspendConfirmOpen] = useState(false);
  const [isSupervisorAuthOpen, setIsSupervisorAuthOpen] = useState(false);
  const [isVoidConfirmOpen, setIsVoidConfirmOpen] = useState(false);
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isApplyDiscountOpen, setIsApplyDiscountOpen] = useState(false);
  const [newQty, setNewQty] = useState<number | null>(null);

  const [cashier, setCashier] = useState<any>(null);

  const qtyRef = useRef<HTMLInputElement>(null);
  const barCodeRef = useRef<HTMLInputElement>(null);
  const cashRef = useRef<HTMLInputElement>(null);

  const beepSound = useRef(new Audio('/beep.mp3'));
  const debounceBarCode = useDebounce(barCode, 2000);

  const handleLoginSuccess = (cashierInfo: any) => {
    console.log('Cashier Info:', cashierInfo);
    setCashier(cashierInfo);
  
    sessionStorage.setItem('fullname', cashierInfo.name);
    sessionStorage.setItem('userId', cashierInfo.id);
  
    router.replace('/cashierpage');
  
    toast({
      title: 'Cashier Logged-in Successfully!',
      description: 'Happy cashiering ^^'
    });
  };

  useEffect(() => {
    const apiURL = 'http://localhost/ororama/app/api/products.php?operation=fetchActiveProduct';
    
    fetch(apiURL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setProductList(data))
      .catch(error => {
        console.error('Error fetching products:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to fetch products',
          description: 'Could not load product data from the server.'
        });
      });
      
  }, [toast]);

  useEffect(() => {
    if (debounceBarCode) {
      if (qty === 0) {
        toast({
          variant: "destructive",
          title: "Invalid Quantity",
          description: "Quantity cannot be zero.",
        });
        setBarCode(''); // Clear the barcode input
        setQty(1); // Reset the quantity
        qtyRef.current?.focus();
        qtyRef.current?.select();
        return; // Exit early if quantity is zero
      }
      const product = productList.find(p => p.product_barcode === debounceBarCode);

      if (!product) {
        toast({
          variant: "destructive",
          title: "Product Not Found",
          description: "The scanned barcode does not match any product.",
        });
        setBarCode(''); // Clear the barcode input
        setQty(1); // Reset the quantity
        qtyRef.current?.focus(); // Focus back on the quantity input
        qtyRef.current?.select();
        return; // Exit early if product not found
      }

      if (product) {
        setOrderList(prevOrderList => {
          const existingOrderIndex = prevOrderList.findIndex(order => order.product === product.product_name);
          if (existingOrderIndex >= 0) {
            return prevOrderList.map((order, index) => {
              if (index === existingOrderIndex) {
                return {
                  ...order,
                  qty: order.qty + qty,
                  amount: (order.qty + qty) * order.price
                };
              }
              return order;
            });
          } else {
            const amt = qty * product.product_price;
            return [...prevOrderList, { id: product.product_id, qty, product: product.product_name, price: product.product_price, amount: amt }];
          }
        });
  
        beepSound.current.play();
      } else {
        setProduct('');
        setPrice(0);
      }
  
      setBarCode('');
      setQty(1);
      qtyRef.current?.focus();
      qtyRef.current?.select();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceBarCode, productList]);

  useEffect(() => {
    setTotal(orderList.reduce((acc: any, order: any) => acc + parseFloat(order.amount), 0));
  }, [orderList]);

  useEffect(() => {
    qtyRef.current?.focus();
    qtyRef.current?.select();
  }, []);
  let calculatedChange = 0;
    let finalTotal = total;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleOrder = async () => {
    if (!orderList.length) {
        toast({
          variant: "destructive",
          title: "There's no order!",
          description: "Please scan or input the barcode to add products.",
        })
        return;
    }

    if(cash < total) {
      toast({
        variant: "destructive",
        title: "Insufficient cash!",
        description: "Please pay the sufficient amount of cash.",
      })
      return;
    }

    if(change > balance){
      toast({
        variant: "destructive",
        title: "Insufficient balance!",
        description: "Not enough balance to give change.",
      })
      return;
    }

    for (const order of orderList) {
      const product = productList.find((p) => p.product_id === order.id);
      if (product && order.qty > product.product_stock) {
        toast({
          variant: "destructive",
          title: "Insufficient stock!",
          description: `The requested quantity for ${order.product} exceeds the available stock.`,
        });
        return;
      }
    }

    
    let discount = 0;

    if (applyDiscount) {
        discount = 1;
        finalTotal *= 0.95;
    }

    // Calculate change only if cash is greater than finalTotal
    if(cash > finalTotal) {
      calculatedChange = cash - finalTotal;
      setChange(calculatedChange);
      setTotal(finalTotal)
    }

    const currentDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const transactionData = {
        cashierId: userId,
        totalAmount: finalTotal,
        cashReceived: cash,
        changeGiven: calculatedChange,
        date: currentDate,
        status: 1,
        discount: discount,
    };

    const formData = new FormData();
    formData.append('operation', 'addTransaction');
    formData.append('json', JSON.stringify(transactionData));

    try {
        // Step 2: Add the transaction
        const transactionResponse = await axios({
            url: 'http://localhost/ororama/app/api/transactions.php',
            method: 'POST',
            data: formData,
        });

        const transactionId = transactionResponse.data.transaction_id;

        if (!transactionId) {
          toast({
            variant: "destructive",
            title: "Transaction failed!",
            description: "There's no transaction ID being passed.",
          })
            return;
        }

        // Step 3: Add the orders related to the transaction
        const orderPromises = orderList.map(order => {
            const orderData = {
                productId: order.id,
                qty: order.qty,
                amount: order.amount,
                transactionId: transactionId,
            };

            const orderFormData = new FormData();
            orderFormData.append('operation', 'addOrder');
            orderFormData.append('json', JSON.stringify(orderData));

            return axios({
                url: 'http://localhost/ororama/app/api/order.php',
                method: 'POST',
                data: orderFormData,
            });
        });

        const orderResponses = await Promise.all(orderPromises);

        const failedOrder = orderResponses.some(response => response.data.status !== 1);

        if (failedOrder) {
          toast({
            variant: "destructive",
            title: "The transaction has failed!",
            description: "Please try again.",
          })
        } else {
          toast({
            title: "Transaction Success!",
            description: "Thank you for buying at Ororama.",
          })

          setBalance(prevBalance => prevBalance + cash - calculatedChange);

            // Reset state for new transaction
            setOrderList([]);
            setTotal(0);
            setCash(0);
            setChange(0);
        }
    } catch (error) {
        console.error('Error during transaction and order submission:', error);
        toast({
          variant: "destructive",
          title: "Error during transaction and order submission!",
        })
    }
  };



  useEffect(() => {
    if(cash >= total){
      setChange(cash - total);
    }else{
      setChange(0);
    }
  }, [cash, total]);
  
  const handleNewOrder = useCallback(() => {
    setOrderList([]);
    setQty(1);
    setBarCode('');
    setProduct('');
    setPrice(0);
    setCash(0);
    setChange(0);
    qtyRef.current?.focus();
    qtyRef.current?.select();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const openEditDialog = () => {
    if (selectedRow !== null) {
      setNewQty(orderList[selectedRow].qty); // Set the current quantity for the selected row
      setIsEditDialogOpen(true); // Open the edit dialog
    }
  };
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const openDeleteDialog = () => {
    if (selectedRow !== null) {
      setIsDeleteDialogOpen(true); // Open the delete dialog
    }
  };
  
  const confirmEditOrder = () => {
    if (selectedRow !== null && newQty !== null) {
      setOrderList(prevOrderList =>
        prevOrderList.map((order, index) =>
          index === selectedRow
            ? { ...order, qty: newQty, amount: newQty * order.price }
            : order
        )
      );
      setIsEditDialogOpen(false); // Close the edit dialog
    }
  };
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const confirmDeleteOrder = () => {
    if (selectedRow !== null) {
      setOrderList(prevOrderList => prevOrderList.filter((_, index) => index !== selectedRow));
      setSelectedRow(null); // Deselect row after deletion
      setIsDeleteDialogOpen(false); // Close the delete dialog
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const suspendTransaction = () => {
    if (orderList.length === 0) {
      toast({
        variant: 'destructive',
        title: "No active transaction to suspend!",
      });
      return;
    }
    console.log(orderList)

    const formattedDate = format(new Date(), 'eeee, MMMM d, yyyy, hh:mm:ss a');

    setSuspendedTransactions(prev => [
      ...prev,
      { id: suspendedTransactions.length + 1, orderList, total, date: formattedDate }
    ]);

    console.log('Transaction suspended with ID:', formattedDate);
  
    handleNewOrder(); // Reset the current order
    toast({
      title: 'Transaction suspended!',
      description: 'You can resume this transaction later.',
    });
  };

  const resumeTransaction = (transactionId: any) => {
    console.log('Attempting to resume Transaction ID:', transactionId);
    console.log('Current Suspended Transactions:', suspendedTransactions);
    
    const transaction = suspendedTransactions.find(t => t.id === transactionId.id);
  
    if (!transaction) {
      console.error('Transaction not found!');
      toast({
        variant: 'destructive',
        title: 'Transaction not found!',
        description: 'The selected transaction could not be found in the suspended list.',
      });
      return;
    }

    setSuspendedTransactions(prev => 
      prev.filter(t => t.id !== transactionId.id)
    );
  
    setOrderList(transaction.orderList);
    setTotal(transaction.total);
    setIsSuspendedListOpen(false);
  
    toast({
      title: 'Transaction Resumed!',
      description: 'You have successfully resumed the suspended transaction.',
    });
  };

  const handleVoidOrder = async () => {

    if (!orderList.length) {
        toast({
          variant: "destructive",
          title: "There's no order!",
          description: "Please scan or input the barcode to add products.",
        })
        return;
    }

    if(change > balance){
      toast({
        variant: "destructive",
        title: "Insufficient balance!",
        description: "Not enough balance to give change.",
      })
      return;
    }

    for (const order of orderList) {
      const product = productList.find((p) => p.product_id === order.id);
      if (product && order.qty > product.product_stock) {
        toast({
          variant: "destructive",
          title: "Insufficient stock!",
          description: `The requested quantity for ${order.product} exceeds the available stock.`,
        });
        return;
      }
    }

    let calculatedChange = 0;

    // Calculate change only if cash is greater than total
    if(cash > total) {
      calculatedChange = cash - total;
      setChange(calculatedChange);
    }
    setChange(calculatedChange);

    const currentDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const transactionData = {
        cashierId: userId,
        totalAmount: total,
        cashReceived: cash,
        changeGiven: calculatedChange,
        date: currentDate,
        status: 0,
        discount: 0
    };

    const formData = new FormData();
      formData.append('operation', 'addTransaction');
      formData.append('json', JSON.stringify(transactionData));

      try {
          // Step 1: Add the transaction
          const transactionResponse = await axios({
              url: 'http://localhost/ororama/app/api/transactions.php',
              method: 'POST',
              data: formData,
          });

          const transactionId = transactionResponse.data.transaction_id;

          if (!transactionId) {
            toast({
              variant: "destructive",
              title: "Transaction failed!",
              description: "There's no transaction ID being passed.",
            })
              return;
          }

          // Step 2: Add the orders related to the transaction
          const orderPromises = orderList.map(order => {
              const orderData = {
                  productId: order.id,
                  qty: order.qty,
                  amount: order.amount,
                  transactionId: transactionId,
              };

              const orderFormData = new FormData();
              orderFormData.append('operation', 'voidOrder');
              orderFormData.append('json', JSON.stringify(orderData));

              return axios({
                  url: 'http://localhost/ororama/app/api/order.php',
                  method: 'POST',
                  data: orderFormData,
              });
          });

          const orderResponses = await Promise.all(orderPromises);

          const failedOrder = orderResponses.some(response => response.data.status !== 1);

          if (failedOrder) {
            toast({
              variant: "destructive",
              title: "The transaction has failed!",
              description: "Please try again.",
            })
          } else {
            toast({
              title: "Transaction Voided!",
              description: "The transaction has been voided.",
            })

            setBalance(prevBalance => prevBalance + cash - calculatedChange);

              // Reset state for new transaction
              setOrderList([]);
              setTotal(0);
              setCash(0);
              setChange(0);
          }
      } catch (error) {
          console.error('Error during transaction and order submission:', error);
          toast({
            variant: "destructive",
            title: "Error during transaction and order submission!",
          })
      }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleLogout = () => {
    // Clear session storage
    sessionStorage.clear();
  
    // Redirect to home page
    router.push('/');
  };
  
  const handleGlobalKeyPress = useCallback((e: any) => {
    switch (e.code) {
      case 'KeyQ':
        setQty(1);
        qtyRef.current?.focus();
        qtyRef.current?.select();
        break;
      case 'KeyW':
        barCodeRef.current?.focus();
        break;
      case 'KeyE':
        cashRef.current?.focus();
        break;
      case 'Enter':
        handleOrder();
        break;
      case 'KeyG':
        e.preventDefault(); // Prevent browser's default save behavior
        setSelectedRow(0);
        break;
      case 'KeyL':
        setIsLoginModalOpen(true);
        break;
      case 'KeyH':
        openDeleteDialog();
        break;
      case 'KeyJ':
        openEditDialog();
        break;
      case 'KeyP':
        handleNewOrder();
        break;
      case 'KeyI':
        setIsDialogOpen(true);
        break;
      case 'KeyO':
        setIsShiftReportOpen(true);
        break;
      case 'KeyT':
        setIsSuspendConfirmOpen(true);
        break;
      case 'KeyS':
        setIsSuspendedListOpen(true);
        break;
      case 'KeyV':
        setIsVoidConfirmOpen(true);
        break;
      case 'KeyB':
        setIsVoidDialogOpen(true);
        break;
      case 'KeyK':
        setIsLogoutConfirmOpen(true);
        break;
      case 'KeyD':
        setIsApplyDiscountOpen(true);
        break;
      case 'KeyN':
        if(isDeleteDialogOpen){
          setIsDeleteDialogOpen(false);
        } else if(isSuspendConfirmOpen){
          setIsSuspendConfirmOpen(false);
        } else if(isVoidConfirmOpen){
          setIsVoidConfirmOpen(false);
        } else if(isLogoutConfirmOpen){
          setIsLogoutConfirmOpen(false);
        } else if(isApplyDiscountOpen){
          setApplyDiscount(false);
          setIsApplyDiscountOpen(false);
        }
        break;
      case 'KeyY':
        if(isDeleteDialogOpen){
          confirmDeleteOrder();
        } else if(isSuspendConfirmOpen){
          suspendTransaction();
          setIsSuspendConfirmOpen(false);
        } else if(isVoidConfirmOpen){
          e.preventDefault();
          setIsSupervisorAuthOpen(true);
          setIsVoidConfirmOpen(false);
        } else if(isLogoutConfirmOpen){
          handleLogout();
        } else if(isApplyDiscountOpen){
          setApplyDiscount(true);
          setIsApplyDiscountOpen(false);
          toast({
            title: "Discount Applied!",
          })
        }
        break;
      case 'ArrowUp':
        if (selectedRow !== null && selectedRow > 0) {
          setSelectedRow(selectedRow - 1);
        }
        break;
      case 'ArrowDown':
        if (selectedRow !== null && selectedRow < orderList.length - 1) {
          setSelectedRow(selectedRow + 1);
        }
        break;
      case 'KeyX':
        setIsLoginModalOpen(false);
        setIsDialogOpen(false);
        setIsShiftReportOpen(false);
        setIsEditDialogOpen(false);
        setIsDeleteDialogOpen(false);
        setIsSuspendedListOpen(false);
        setIsSupervisorAuthOpen(false);
        setIsVoidDialogOpen(false);
        break;
      default:
        break;
    }
  }, [toast, handleOrder, handleNewOrder, openEditDialog, openDeleteDialog, selectedRow, orderList, confirmDeleteOrder, isDeleteDialogOpen, isSuspendConfirmOpen, suspendTransaction, isVoidConfirmOpen, handleLogout, isLogoutConfirmOpen, isApplyDiscountOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyPress);
    };
  }, [handleGlobalKeyPress]);

  const handleNumericInput = (setter: any) => (e: any) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    setter(numericValue);
  };

  const handleBarcodeDetected = (barcode:any) => {
    setBarCode(barcode);
    if (debounceBarCode) {
      setBarCode('');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 h-screen bg-muted">
      <div className="flex justify-center">
        <Image src='/logo-name.png' alt='' width={400} height={100} />
      </div>
      <div className='flex justify-between'>
        <Button variant='link' onClick={() => setIsLoginModalOpen(true)}>Change shift</Button>
        <Button variant='link' onClick={() => setIsLogoutConfirmOpen(true)}>Log out</Button>
      </div>
      

      <CashierLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <div className="flex justify-between items-center">
        
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="h-auto md:h-[540px] border border-primary shadow-xl bg-white">
          <CardHeader>
            <div className="text-left text-lg md:text-3xl font-bold">
              Hello, {fullname}!
            </div>
          </CardHeader>
          <Separator className='bg-primary' />
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between mb-4">
              <Label className="text-lg">Quantity</Label>
              <Input
                className="w-full md:w-[200px] mt-2 md:mt-0"
                ref={qtyRef}
                type="text"
                value={qty}
                onChange={handleNumericInput((value: any) => setQty(Number(value)))}
              />
            </div>
            <div className="flex flex-col md:flex-row md:justify-between mb-4">
              <Label className="text-lg">Bar Code</Label>
              <Input
                className="w-full md:w-[200px] mt-2 md:mt-0"
                ref={barCodeRef}
                type="text"
                value={barCode}
                onChange={handleNumericInput(setBarCode)}
              />
            </div>
            <div className="flex justify-center items-center">
              <Image src='/logo.png' alt='' width={350} height={350} />
            </div>
            <BarcodeScanner onDetected={handleBarcodeDetected} />
          </CardContent>
        </Card>
        <div className="col-span-1 md:col-span-3">
          <Card className="h-[540px] border border-primary shadow-xl bg-white">
            <CardHeader>
            <div className="flex justify-between items-center"> 
              <div className="text-right text-xl md:text-3xl font-bold text-primary">BALANCE: ₱{balance.toFixed(2)}</div>
              <div className="text-right text-xl md:text-3xl font-bold text-primary">TOTAL: ₱{total.toFixed(2)}</div>
            </div>
            </CardHeader>
            <Separator className='bg-primary' />
            <CardContent className="p-4">
              <ScrollArea className="h-[417px] rounded-md border p-4 border-primary">
                <Table className="">
                  <TableHeader>
                    <TableRow >
                      <TableHead>Quantity</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderList.map((order: any, index: number) => (
                      <TableRow
                      key={index}
                      onClick={() => setSelectedRow(index)}
                      className={selectedRow === index ? 'bg-orange-300' : ''}
                    >
                        <TableCell>{order.qty}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell>{order.price}</TableCell>
                        <TableCell>{order.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
          <div className="flex flex-col mt-4 md:flex-row md:mt-8 gap-x-4">
            <div className="flex flex-col md:flex-row gap-x-4 text-xl justify-end items-center">
              <div className="text-3xl text-primary font-semibold">CASH:</div>
              <Input
                className="w-full text-3xl md:w-[200px] bg-white"
                type="text"
                ref={cashRef}
                value={cash}
                onChange={handleNumericInput((value: any) => setCash(Number(value)))}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-x-4 text-xl justify-end items-center">
              <div className="text-3xl text-primary font-semibold">CHANGE:</div>
              <Input className="w-full text-3xl md:w-[200px] border border-none bg-white" value={change} readOnly />
            </div>
          </div>
        </div>
      </div>

      <SalesReportModal
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      
      <ShiftReportModal
        isOpen={isShiftReportOpen}
        onClose={setIsShiftReportOpen}
        cashierId = {userId}
        cashierName = {fullname}
      />

      <SuspendedListModal
        isOpen={isSuspendedListOpen}
        onOpenChange={setIsSuspendedListOpen}
        suspendedList={suspendedTransactions}
        resumeTransaction={resumeTransaction}
      />

      <SupervisorAuthModal 
        isOpen={isSupervisorAuthOpen}
        onClose={setIsSupervisorAuthOpen}
        handleVoidOrder={handleVoidOrder}
      />

      <VoidReportModal 
        isOpen={isVoidDialogOpen}
        onOpenChange={setIsVoidDialogOpen}
      />

      {/* Edit Order Dialog */}
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogDescription>Modify the quantity of the selected order.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Label>New Quantity:</Label>
          <Input
            type="number"
            value={newQty || ''}
            onChange={(e) => setNewQty(parseInt(e.target.value))}
          />
        </div>
        <DialogFooter>
          <Button className='h-1 opacity-0' onClick={confirmEditOrder}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete Order Dialog */}
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Order</DialogTitle>
          <DialogDescription>Are you sure you want to delete this order?</DialogDescription>
        </DialogHeader>
        <DialogFooter >
          <div className='flex justify-center text-lg'>
            ( Y / N )?
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={isSuspendConfirmOpen} onOpenChange={setIsSuspendConfirmOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspend Transaction</DialogTitle>
          <DialogDescription>Are you sure you want to suspend this transaction?</DialogDescription>
        </DialogHeader>
        <DialogFooter >
          <div className='flex justify-center text-lg'>
            ( Y / N )?
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={isVoidConfirmOpen} onOpenChange={setIsVoidConfirmOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Void Transaction</DialogTitle>
          <DialogDescription>Are you sure you want to void this transaction?</DialogDescription>
        </DialogHeader>
        <DialogFooter >
          <div className='flex justify-center text-lg'>
            ( Y / N )?
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={isLogoutConfirmOpen} onOpenChange={setIsLogoutConfirmOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Out</DialogTitle>
          <DialogDescription>Are you sure you want to log out?</DialogDescription>
        </DialogHeader>
        <DialogFooter >
          <div className='flex justify-center text-lg'>
            ( Y / N )?
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={isApplyDiscountOpen} onOpenChange={setIsApplyDiscountOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
          <DialogDescription>Is the customer applicable for discount?</DialogDescription>
        </DialogHeader>
        <DialogFooter >
          <div className='flex justify-center text-lg'>
            ( Y / N )?
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
}
