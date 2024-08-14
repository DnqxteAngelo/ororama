'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

import AddCashierModal from '@/components/modals/addCashierModal/addCashier';
import UpdateCashierModal from '@/components/modals/updateCashierModal/updateCashier';
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  ChevronRight,
  ChevronLeft
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import SideBar from "@/components/sideBar/sidebar";

type Cashier = {
  user_id: number;
  user_username: string;
  user_fullname: string;
};


export default function Cashier() {
  const [isAddCashierModalOpen, setIsAddCashierModalOpen] = useState(false);
  const [isUpdateCashierModalOpen, setIsUpdateCashierModalOpen] = useState(false);
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const [countCashier, setCountCashier] = useState<number>(0);

  // Fetch products from the backend
  useEffect(() => {
    const fetchCashiers = async () => {
      try {
        const response = await axios.get('http://localhost/ororama/app/api/cashiers.php', {
          params: {
            operation: 'getCashier'
          }
        });
        console.log(response.data);
        setCashiers(response.data); // Store the products in state
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchCashiers(); // Call the fetch function on component mount
  }, []);

  const fetchCashierCount = async () => {
    try {
      const response = await axios.get('http://localhost/ororama/app/api/cashiers.php', {
        params: {
          operation: 'countCashiers'
        }
      });
      const cashierNum = response.data[0]?.cashierNum || 0;
      setCountCashier(cashierNum); // Update state with the latest count
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  
  // Fetch product count on component mount
  useEffect(() => {
    fetchCashierCount();
  
    // Polling every 30 seconds (30000 ms)
    const intervalId = setInterval(fetchCashierCount, 5000);
  
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SideBar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="flex gap-x-8">
              <Card className="w-[300px]">
                <CardHeader className="pb-6">
                  <CardDescription>Total # of Cashiers</CardDescription>
                  <CardTitle className="text-4xl">{countCashier} Cashiers</CardTitle>
                </CardHeader>
              </Card>
          </div>
        
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-7 gap-1"
                  onClick={() => setIsAddCashierModalOpen(true)} // Open modal on click
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Cashier
                  </span>
                </Button>
              </div>
            </div>

            {/* All Products Tab */}
            <TabsContent value="all">
              <Card className='h-[580px]'>
                <CardHeader>
                  <CardTitle>All Cashier</CardTitle>
                  <CardDescription>Manage the cashiers.</CardDescription>
                </CardHeader>
                <CardContent className='h-[430px]'>
                  <Table >
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cashiers.map((cashier) => (
                        <TableRow key={cashier.user_id}>
                          <TableCell>{cashier.user_username}</TableCell>
                          <TableCell>{cashier.user_fullname}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedCashier(cashier); // Set the selected product
                                    setIsUpdateCashierModalOpen(true); // Open the update modal
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
  
      {/* AddProductModal */}
      <AddCashierModal 
        isOpen={isAddCashierModalOpen} 
        onClose={() => setIsAddCashierModalOpen(false)} 
        setCashiers={setCashiers} 
      />
      <UpdateCashierModal 
        isOpen={isUpdateCashierModalOpen} 
        onClose={() => setIsUpdateCashierModalOpen(false)}
        cashier={selectedCashier}  // Pass the selected product
        setCashiers={setCashiers} 
      />

    </div>
  )
}
