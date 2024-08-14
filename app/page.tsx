'use client';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async () => {
    // Validation for empty input fields and whitespaces
    if (!username.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Username and password cannot be empty or just whitespace.",
      });
      return;
    }

    try {
      const formData = new FormData();
      const data = {
        username: username.trim(),
        password: password.trim(),
      };

      formData.append("json", JSON.stringify(data));
      formData.append("operation", "login");

      const response = await axios({
        url: "http://localhost/ororama/app/api/auth.php",
        method: "post",
        data: formData
      });

      if (response.data) {
        const roleId = response.data.roleId;
        const fullname = response.data.fullname;
        const userId = response.data.userId;

        sessionStorage.setItem('fullname', fullname);
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('roleId', roleId);

        if (roleId === 1) {
            // Navigate to admin page
            router.push('./adminpage/order');
        } else if (roleId === 2) {
            // Navigate to cashier page
            router.push('./cashierpage');
        } else {
          toast({
            variant: "destructive",
            title: "Invalid role",
            description: "User has an invalid role.",
          });
        }
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
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex flex-col bg-none items-center justify-center py-12 rounded-2xl z-10">
        <div className="mb-10">
          <Image
            src="/logo-name.png"
            alt="Image"
            width="350"
            height="150"
          />
        </div>
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your username and password below to login to your account
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="text">Username</Label>
              <Input
                id="text"
                type="text"
                placeholder="Enter username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted z-0 lg:block">
        <Image
          src="/background.jpg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
