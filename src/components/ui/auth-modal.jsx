import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus } from "lucide-react";

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
        await signIn(email, password);
      }
      setIsAuthModalOpen(false); 
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Login' : 'Sign Up'}
          </DialogTitle>
          <DialogDescription className="text-center text-slate-400">
            {isLogin 
              ? "Enter your credentials to access your account." 
              : "Create an account to save your solver progress."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
           {!isLogin && (
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input className="bg-slate-800 border-slate-700" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
          )}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" className="bg-slate-800 border-slate-700" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" className="bg-slate-800 border-slate-700" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
            {isLogin ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-sm text-slate-400 hover:text-white">
            {isLogin ? "Need an account? Sign up" : "Have an account? Log in"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
