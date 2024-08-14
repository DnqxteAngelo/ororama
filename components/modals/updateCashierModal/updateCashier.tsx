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

export default function UpdateCashierModal({ isOpen, onClose, cashier, setCashiers }: any) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (cashier) {
            setUsername(cashier.user_username || '');
            setPassword(cashier.user_password || '');
            setFullname(cashier.user_fullname || '');
        }
    }, [cashier]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // Validation
        if (!username.trim() || !password.trim() || !fullname.trim()) {
            setErrorMessage("All fields are required and cannot contain only whitespace.");
            return;
        }

        const url = 'http://localhost/ororama/app/api/cashiers.php';

        const jsonData = {
            cashierId: cashier.user_id,
            username: username.trim(),
            password: password.trim(),
            fullname: fullname.trim(),
        };

        const formData = new FormData();
        formData.append('operation', 'updateCashier');
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

                // Fetch all cashiers again to update the list
                const cashiersResponse = await axios.get(url, {
                    params: {
                        operation: 'getCashier'
                    }
                });
                setCashiers(cashiersResponse.data); // Update the cashiers state with the latest data

            } else {
                alert(response.data.message || "Failed to update cashier.");
            }
        } catch (error) {
            alert("Error updating cashier.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Cashier</DialogTitle>
                    <DialogDescription>
                        Update the cashier information below.
                    </DialogDescription>
                </DialogHeader>
                {showAlert && (
                    <Alert>
                        <PackageCheck className="h-4 w-4" />
                        <AlertTitle>Cashier Updated</AlertTitle>
                        <AlertDescription>
                            Successfully updated the cashier.
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
                            <Label htmlFor="username" className="text-right">
                                Username
                            </Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="fullname" className="text-right">
                                Full Name
                            </Label>
                            <Input
                                id="fullname"
                                value={fullname}
                                onChange={(e) => setFullname(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Update Cashier</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
