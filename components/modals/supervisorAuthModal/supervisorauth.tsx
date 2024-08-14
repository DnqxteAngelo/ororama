import React from 'react';
import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function SupervisorAuthModal({ isOpen, onClose, handleVoidOrder}: any) {
  const [password, setPassword] = useState('');

  const { toast } = useToast();

  const handleSupervisorLogin = async () => {
    try {
      const formData = new FormData();
      const data = {
        password: password,
      };

      formData.append("json", JSON.stringify(data));
      formData.append("operation", "voidAuth");

      const response = await axios({
        url: "http://localhost/ororama/app/api/auth.php",
        method: "post",
        data: formData
      });

      if (response.data) {
        const fullname = response.data.fullname;
        const userId = response.data.userId;
        
        handleVoidOrder();
        setPassword('')
        onClose(false);
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
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Admin Authentication</DialogTitle>
        <DialogDescription>Please enter the admin password to proceed.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <Label>Admin Password:</Label>
        <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={!isOpen}
          />
      </div>
      <Button className='h-1 opacity-0' onClick={handleSupervisorLogin}>Login</Button>
    </DialogContent>
    <DialogFooter >
    </DialogFooter>
  </Dialog>
  
  );
};

