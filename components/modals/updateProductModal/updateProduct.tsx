import { useState, useEffect } from 'react';
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

import { PackageCheck } from "lucide-react";

export default function UpdateProductModal({ isOpen, onClose, product, setProducts }: any) {
    const [barcode, setBarcode] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (product) {
            setBarcode(product.product_barcode || '');
            setName(product.product_name || '');
            setPrice(product.product_price || '');
            setStock(product.product_stock || '');
        }
    }, [product]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // Validation
        if (!barcode.trim() || !name.trim() || !price.trim() || !stock.trim()) {
            setErrorMessage("All fields are required and cannot contain only whitespace.");
            return;
        }

        const url = 'http://localhost/ororama/app/api/products.php';

        const jsonData = {
            productId: product.product_id,
            barcode: barcode.trim(),
            name: name.trim(),
            price: price.trim(),
            stock: stock.trim(),
        };

        const formData = new FormData();
        formData.append('operation', 'updateProduct');
        formData.append('json', JSON.stringify(jsonData));

        try {
            const response = await axios({
                url: url,
                method: "POST",
                data: formData,
            });
            console.log(response.data);
            if (response.data == 1) {
                setShowAlert(true);

                setTimeout(() => {
                    setShowAlert(false); // Hide the alert after 2 seconds
                    onClose(); // Close the modal
                }, 2000);

                // Fetch all products again to update the list
                const productsResponse = await axios.get(url, {
                    params: {
                        operation: 'getProduct'
                    }
                });
                setProducts(productsResponse.data); // Update the products state with the latest data

            } else {
                alert(response.data.message || "Failed to update product.");
            }
        } catch (error) {
            alert("Error updating product.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Product</DialogTitle>
                    <DialogDescription>
                        Update the product information below.
                    </DialogDescription>
                </DialogHeader>
                {showAlert && (
                    <Alert>
                        <PackageCheck className="h-4 w-4" />
                        <AlertTitle>Product Updated</AlertTitle>
                        <AlertDescription>
                            Successfully updated the product.
                        </AlertDescription>
                    </Alert>
                )}
                {errorMessage && (
                    <Alert>
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{errorMessage}</AlertDescription>
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
                                onChange={(e) => setBarcode(e.target.value)}
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
                                onChange={(e) => setName(e.target.value)}
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
                                onChange={(e) => setPrice(e.target.value)}
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
                                onChange={(e) => setStock(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Update Product</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
