'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

import AddProductModal from '@/components/modals/addProductModal/addProduct';
import UpdateProductModal from '@/components/modals/updateProductModal/updateProduct';
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

type Product = {
  product_id: number;
  product_barcode: string;
  product_name: string;
  product_price: number;
  product_stock: number;
  product_status: number;
};


export default function Product() {
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isUpdateProductModalOpen, setIsUpdateProductModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [countProduct, setCountProduct] = useState<number>(0);
  const [countActiveProduct, setCountActiveProduct] = useState<number>(0);
  const [countArchivedProduct, setCountArchivedProduct] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  const indexOfLastProduct = currentPage * rowsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - rowsPerPage;

  // Filter products based on status
  const activeProducts = products.filter(product => product.product_status === 1);
  const archivedProducts = products.filter(product => product.product_status === 0);

  // Paginate the filtered products
  const currentActiveProducts = activeProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const currentArchivedProducts = archivedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const currentAllProducts = products.slice(indexOfFirstProduct, indexOfLastProduct); // For the "All" tab

  const handleNextPage = (productType: string) => {
    const totalProducts = 
      productType === "all" ? products.length : 
      productType === "active" ? activeProducts.length : 
      archivedProducts.length;
    if (currentPage < Math.ceil(totalProducts / rowsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost/ororama/app/api/products.php', {
          params: {
            operation: 'getProduct'
          }
        });
        console.log(response.data);
        setProducts(response.data); // Store the products in state
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts(); // Call the fetch function on component mount
  }, []);

  const archiveProduct = async (productId: number) => {
    const url = 'http://localhost/ororama/app/api/products.php';

    const jsonData = {
        productId: productId,
        status: 0
    };

    const formData = new FormData();
    formData.append('operation', 'archiveAndRestoreProduct');
    formData.append('json', JSON.stringify(jsonData));

    try {
        const response = await axios.post(url, formData);
        if (response.data === 1) {
            console.log("Product archived successfully.");

            setProducts(prevProducts =>
              prevProducts.map(product =>
                product.product_id === productId
                  ? { ...product, product_status: 0 }
                  : product
              )
            );
        } else {
            console.log("Failed to archive product.");
        }
    } catch (error) {
        console.error("Error archiving product:", error);
    }
  };

  const restoreProduct = async (productId: number) => {
    const url = 'http://localhost/ororama/app/api/products.php';

    const jsonData = {
        productId: productId,
        status: 1
    };

    const formData = new FormData();
    formData.append('operation', 'archiveAndRestoreProduct'); // Use the operation for restoring
    formData.append('json', JSON.stringify(jsonData));

    try {
        const response = await axios.post(url, formData);
        if (response.data === 1) {
            console.log("Product restored successfully.");

            setProducts(prevProducts =>
              prevProducts.map(product =>
                product.product_id === productId
                  ? { ...product, product_status: 1 }
                  : product
              )
            );
        } else {
            console.log("Failed to restore product.");
        }
    } catch (error) {
        console.error("Error restoring product:", error);
    }
  };

  const fetchProductCount = async () => {
    try {
      const response = await axios.get('http://localhost/ororama/app/api/products.php', {
        params: {
          operation: 'countProduct'
        }
      });
      const productNum = response.data[0]?.productNum || 0;
      setCountProduct(productNum); // Update state with the latest count
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchActiveProductCount = async () => {
    try {
      const response = await axios.get('http://localhost/ororama/app/api/products.php', {
        params: {
          operation: 'countActiveProduct'
        }
      });
      const productNum = response.data[0]?.productNum || 0;
      setCountActiveProduct(productNum); // Update state with the latest count
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchArchivedProductCount = async () => {
    try {
      const response = await axios.get('http://localhost/ororama/app/api/products.php', {
        params: {
          operation: 'countArchivedProduct'
        }
      });
      const productNum = response.data[0]?.productNum || 0;
      setCountArchivedProduct(productNum); // Update state with the latest count
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  
  // Fetch product count on component mount
  useEffect(() => {
    fetchProductCount();
  
    // Polling every 30 seconds (30000 ms)
    const intervalId = setInterval(fetchProductCount, 5000);
  
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchActiveProductCount();
  
    // Polling every 30 seconds (30000 ms)
    const intervalId = setInterval(fetchActiveProductCount, 5000);
  
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    fetchArchivedProductCount();
  
    // Polling every 30 seconds (30000 ms)
    const intervalId = setInterval(fetchArchivedProductCount, 5000);
  
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
                  <CardDescription>Total # of Products</CardDescription>
                  <CardTitle className="text-4xl">{countProduct} Products</CardTitle>
                </CardHeader>
              </Card>
              <Card className="w-[300px]">
                <CardHeader className="pb-6">
                  <CardDescription>Total # of Active Products</CardDescription>
                  <CardTitle className="text-4xl">{countActiveProduct} Products</CardTitle>
                </CardHeader>
              </Card>
              <Card className="w-[300px]">
                <CardHeader className="pb-6">
                  <CardDescription>Total # of Archived Products</CardDescription>
                  <CardTitle className="text-4xl">{countArchivedProduct} Products</CardTitle>
                </CardHeader>
              </Card>
          </div>
        
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-7 gap-1"
                  onClick={() => setIsAddProductModalOpen(true)} // Open modal on click
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Product
                  </span>
                </Button>
              </div>
            </div>

            {/* All Products Tab */}
            <TabsContent value="all">
              <Card className='h-[580px]'>
                <CardHeader>
                  <CardTitle>All Products</CardTitle>
                  <CardDescription>Manage your products.</CardDescription>
                </CardHeader>
                <CardContent className='h-[430px]'>
                  <Table >
                    <TableHeader>
                      <TableRow>
                        <TableHead>Barcode</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.slice(indexOfFirstProduct, indexOfLastProduct).map((product) => (
                        <TableRow key={product.product_id}>
                          <TableCell>{product.product_barcode}</TableCell>
                          <TableCell>{product.product_name}</TableCell>
                          <TableCell>{product.product_price}</TableCell>
                          <TableCell>{product.product_stock}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {product.product_status === 1 ? 'Active' : 'Archived'}
                            </Badge>
                          </TableCell>
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
                                    setSelectedProduct(product); // Set the selected product
                                    setIsUpdateProductModalOpen(true); // Open the update modal
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {product.product_status === 1 ? archiveProduct(product.product_id) : restoreProduct(product.product_id)} }
                                >
                                  {product.product_status === 1 ? 'Delete' : 'Restore'}
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
                  <div className="flex justify-between gap-x-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      Showing <strong>{indexOfFirstProduct + 1}</strong> to <strong>{Math.min(indexOfLastProduct, products.length)}</strong> of <strong>{products.length}</strong> products
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNextPage("all")}
                      disabled={currentPage >= Math.ceil(products.length / rowsPerPage)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Active Products Tab */}
            <TabsContent value="active">
              <Card className='h-[580px]'>
                <CardHeader>
                  <CardTitle>Active Products</CardTitle>
                  <CardDescription>Manage your active products.</CardDescription>
                </CardHeader>
                <CardContent className='h-[430px]'>
                  <Table >
                    <TableHeader>
                      <TableRow>
                        <TableHead>Barcode</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentActiveProducts.map((product) => (
                        <TableRow key={product.product_id}>
                          <TableCell>{product.product_barcode}</TableCell>
                          <TableCell>{product.product_name}</TableCell>
                          <TableCell>{product.product_price}</TableCell>
                          <TableCell>{product.product_stock}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {product.product_status === 1 ? 'Active' : 'Archived'}
                            </Badge>
                          </TableCell>
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
                                    setSelectedProduct(product); // Set the selected product
                                    setIsUpdateProductModalOpen(true); // Open the update modal
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {product.product_status === 1 ? archiveProduct(product.product_id) : restoreProduct(product.product_id)} }
                                >
                                  {product.product_status === 1 ? 'Delete' : 'Restore'}
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
                  <div className="flex justify-between gap-x-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviousPage()}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      Showing <strong>{indexOfFirstProduct + 1}</strong> to <strong>{Math.min(indexOfLastProduct, activeProducts.length)}</strong> of <strong>{activeProducts.length}</strong> products
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNextPage("active")}
                      disabled={currentPage >= Math.ceil(activeProducts.length / rowsPerPage)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Archived Products Tab */}
            <TabsContent value="archived">
              <Card className='h-[580px]'>
                <CardHeader>
                  <CardTitle>Archived Products</CardTitle>
                  <CardDescription>Manage your archived products.</CardDescription>
                </CardHeader>
                <CardContent className='h-[430px]'>
                  <Table >
                    <TableHeader>
                      <TableRow>
                        <TableHead>Barcode</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentArchivedProducts.map((product) => (
                        <TableRow key={product.product_id}>
                          <TableCell>{product.product_barcode}</TableCell>
                          <TableCell>{product.product_name}</TableCell>
                          <TableCell>{product.product_price}</TableCell>
                          <TableCell>{product.product_stock}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {product.product_status === 1 ? 'Active' : 'Archived'}
                            </Badge>
                          </TableCell>
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
                                    setSelectedProduct(product); // Set the selected product
                                    setIsUpdateProductModalOpen(true); // Open the update modal
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {product.product_status === 1 ? archiveProduct(product.product_id) : restoreProduct(product.product_id)} }
                                >
                                  {product.product_status === 1 ? 'Delete' : 'Restore'}
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
                  <div className="flex justify-between gap-x-2 items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviousPage()}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      Showing <strong>{indexOfFirstProduct + 1}</strong> to <strong>{Math.min(indexOfLastProduct, archivedProducts.length)}</strong> of <strong>{archivedProducts.length}</strong> products
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNextPage("archived")}
                      disabled={currentPage >= Math.ceil(archivedProducts.length / rowsPerPage)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

          </Tabs>
        </main>
      </div>
  
      {/* AddProductModal */}
      <AddProductModal 
        isOpen={isAddProductModalOpen} 
        onClose={() => setIsAddProductModalOpen(false)} 
        setProducts={setProducts} 
      />
      <UpdateProductModal 
        isOpen={isUpdateProductModalOpen} 
        onClose={() => setIsUpdateProductModalOpen(false)}
        product={selectedProduct}  // Pass the selected product
        setProducts={setProducts} 
      />

    </div>
  )
}
