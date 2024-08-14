import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import axios from "axios"

import { useRouter } from 'next/navigation';


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '../../ui/button';

import { useToast } from "@/components/ui/use-toast";

interface Cashier {
  user_id: number;
  user_fullname: string;
  user_username: string;
}


export default function CashierLoginModal({ isOpen, onClose, onLoginSuccess }: any) {
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [cashierId, setCashierId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();

  const { toast } = useToast();

  const selectRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('http://localhost/ororama/app/api/cashiers.php?operation=getCashier')
      .then(response => response.json())
      .then(data => setCashiers(data))
      .catch(error => {
        console.error('Failed to fetch cashiers:', error);
        setError('Failed to load cashiers');
      });
  }, []);
  

  useEffect(() => {
    selectRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'F1':
          selectRef.current?.click();
          break;
        case 'F2':
          inputRef.current?.focus();
          break;
        // case 'Enter':
        //   if (event.shiftKey) {
        //     handleLogin();
        //   }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  const handleLogin = async () => {
    try {
        const formData = new FormData();
        const data = {
            username: cashierId,
            password: password
        };

        formData.append("json", JSON.stringify(data));
        formData.append("operation", "loginCashier");

        const response = await axios({
            url: "http://localhost/ororama/app/api/cashiers.php",
            method: "post",
            data: formData
        });

        console.log('Response:', response.data);  // Log the response to see what is returned

        if (!response.data) {
            throw new Error('Network response was not ok');
        }

        if (response.data) {
            console.log('Login Success:', response.data.userId, response.data.fullname); // Log the individual fields
            onLoginSuccess({
                id: response.data.userId,
                name: response.data.fullname
            });
            setCashierId('');
            setPassword('');
            onClose();
        } else {
            toast({
                variant: "destructive",
                title: "Login failed",
                description: "Invalid username or password.",
            });
        }
    } catch (error) {
        console.error('Login failed:', error);
        toast({
            variant: "destructive",
            title: "Login failed",
            description: "An error occurred during login. Please try again.",
        });
    }
};

  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border border-primary">
        <DialogHeader>
          <DialogTitle>Login as Cashier</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Label>Cashier</Label>
          <Select value={cashierId} onValueChange={setCashierId}>
            <SelectTrigger ref={selectRef}>
              <SelectValue placeholder="Select Cashier" />
            </SelectTrigger>
            <SelectContent ref={selectContentRef}>
              {cashiers.map(cashier => (
                <SelectItem key={cashier.user_id} value={cashier.user_username}>
                  {cashier.user_fullname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label>Password</Label>
          <Input
            ref={inputRef}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
          />
          <Button className='h-1 opacity-0' onClick={handleLogin}>Login</Button>
          {/* {error && <p>{error}</p>} */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
