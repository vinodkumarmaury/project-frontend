'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Settings, History, User as UserIcon } from "lucide-react";
import Link from 'next/link';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/sign-in');
    } else {
      setIsLoading(false);
    }
  }, [token, router]);

  if (isLoading || !user) {
    return (
      <div className="container flex items-center justify-center py-32">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback>
                  {user.username?.substring(0, 2).toUpperCase() || "RB"}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Link href="/settings">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Tabs defaultValue="predictions">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="predictions" className="flex gap-2 items-center">
              <BarChart className="h-4 w-4" /> 
              <span>Predictions</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex gap-2 items-center">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex gap-2 items-center">
              <UserIcon className="h-4 w-4" />
              <span>Account</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="predictions" className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/predictions" className="w-full">
                <Button variant="secondary" className="w-full justify-start">
                  <BarChart className="h-4 w-4 mr-2" />
                  New Prediction
                </Button>
              </Link>
              <Link href="/tools/cost-calculator" className="w-full">
                <Button variant="secondary" className="w-full justify-start">
                  <BarChart className="h-4 w-4 mr-2" />
                  Cost Calculator
                </Button>
              </Link>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <Link href="/predictions/history">
              <Button variant="secondary" className="w-full justify-start">
                <History className="h-4 w-4 mr-2" />
                View Complete History
              </Button>
            </Link>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-4 pt-4">
            <h3 className="text-lg font-medium">Account Management</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/settings" className="w-full">
                <Button variant="secondary" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </Link>
              <Link href="/settings?tab=security" className="w-full">
                <Button variant="secondary" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}