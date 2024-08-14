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


export default function AddCashierModal({ isOpen, onClose, setCashiers }: any) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [showError, setShowError] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault(); // Prevent default form submission
    
        // Trim input values and validate
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();
        const trimmedFullname = fullname.trim();
    
        if (!trimmedUsername || !trimmedPassword || !trimmedFullname) {
            setShowError(true);
            setTimeout(() => {
                setShowError(false); // Hide the alert after 2 seconds
            }, 5000); // Adjust the time as needed
            return; // Stop form submission if any field is invalid
        }
    
        const url = 'http://localhost/ororama/app/api/cashiers.php';
    
        const jsonData = {
            username: trimmedUsername,
            password: trimmedPassword,
            fullname: trimmedFullname,
            roleId: 2
        };
    
        const formData = new FormData();
        formData.append('operation', 'addCashier');
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
                setUsername('');
                setPassword('');
                setFullname('');
    
                setTimeout(() => {
                    setShowAlert(false); // Hide the alert after 2 seconds
                    onClose(); // Close the modal
                }, 2000); // Adjust the time as needed
    
                // Fetch all products again to update the list
                const cashiersResponse = await axios.get(url, {
                    params: {
                        operation: 'getCashier'
                    }
                });
                setCashiers(cashiersResponse.data); // Update the products state with the latest data
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
                    <DialogTitle>Add Cashier</DialogTitle>
                    <DialogDescription>
                        Input cashier details to add cashier.
                    </DialogDescription>
                </DialogHeader>
                {showAlert && (
                    <Alert>
                        <PackagePlus className="h-4 w-4" />
                        <AlertTitle>Cashier Added</AlertTitle>
                        <AlertDescription>
                            Successfully added the cashier.
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
                                Username
                            </Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                }}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Full Name
                            </Label>
                            <Input
                                id="fullname"
                                value={fullname}
                                onChange={(e) => {
                                    setFullname(e.target.value);
                                }}
                                className="col-span-3" 
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                }}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Add Cashier</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
