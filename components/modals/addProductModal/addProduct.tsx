import { useState } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader, 
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast";

import {
    PackagePlus
  } from "lucide-react"


export default function AddProductModal({ isOpen, onClose, setProducts }: any) {
    const [barcode, setBarcode] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [showError, setShowError] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault(); // Prevent default form submission
    
        // Trim input values and validate
        const trimmedBarcode = barcode.trim();
        const trimmedName = name.trim();
        const trimmedPrice = price.trim();
        const trimmedStock = stock.trim();
    
        if (!trimmedBarcode || !trimmedName || !trimmedPrice || !trimmedStock) {
            setShowError(true);
            setTimeout(() => {
                setShowError(false); // Hide the alert after 2 seconds
            }, 5000); // Adjust the time as needed
            return; // Stop form submission if any field is invalid
        }
    
        const url = 'http://localhost/ororama/app/api/products.php';
    
        const jsonData = {
            barcode: trimmedBarcode,
            name: trimmedName,
            price: trimmedPrice,
            stock: trimmedStock,
            status: 1
        };
    
        const formData = new FormData();
        formData.append('operation', 'addProduct');
        formData.append('json', JSON.stringify(jsonData));
    
        try {
            const response = await axios({
                url: url,
                method: "POST",
                data: formData,
            });
    
            if (response.data == 1) {  // Assuming 1 means success
                setShowAlert(true); // Show the success alert
    
                // Clear input fields
                setBarcode('');
                setName('');
                setPrice('');
                setStock('');
    
                setTimeout(() => {
                    setShowAlert(false); // Hide the alert after 2 seconds
                    onClose(); // Close the modal
                }, 2000); // Adjust the time as needed
    
                // Fetch all products again to update the list
                const productsResponse = await axios.get(url, {
                    params: {
                        operation: 'getProduct'
                    }
                });
                setProducts(productsResponse.data); // Update the products state with the latest data
            } else {
                alert("Failed to add product.");
            }
        } catch (error) {
            alert("Error");
        }
    };
    


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Product</DialogTitle>
                    <DialogDescription>
                        Input product descriptions to add product.
                    </DialogDescription>
                </DialogHeader>
                {showAlert && (
                    <Alert>
                        <PackagePlus className="h-4 w-4" />
                        <AlertTitle>Product Added</AlertTitle>
                        <AlertDescription>
                            Successfully added the product.
                        </AlertDescription>
                    </Alert>
                )}
                {showError && (
                    <Alert variant="destructive">
                        <PackagePlus className="h-4 w-4" />
                        <AlertTitle>Invalid Input</AlertTitle>
                        <AlertDescription>
                            All fields must be filled out!
                        </AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="barcode" className="text-right">
                                Barcode
                            </Label>
                            <Input
                                id="barcode"
                                value={barcode}
                                onChange={(e) => {
                                    setBarcode(e.target.value);
                                }}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                }}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Price
                            </Label>
                            <Input
                                id="price"
                                value={price}
                                onChange={(e) => {
                                    setPrice(e.target.value);
                                }}
                                className="col-span-3" 
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right">
                                Stock
                            </Label>
                            <Input
                                id="stock"
                                value={stock}
                                onChange={(e) => {
                                    setStock(e.target.value);
                                }}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Add Product</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
