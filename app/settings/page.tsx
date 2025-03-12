"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";
import { api } from "@/lib/api";
import {
  User,
  Bell,
  Monitor,
  Globe,
  FileText,
  Lock,
  Shield,
  Save,
  Loader2,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { user, token, logout, updateUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [dirty, setDirty] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: false,
    pushNotifications: false,
    language: "en",
    theme: "system",
    dataExportFormat: "csv",
    dataRetention: "30days",
    autoSave: true,
  });

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    name: "",
    email: "",
    profileImage: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchSettings = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      // Try to load from API
      const data = await api.get("/api/settings");
      setSettings(data);

      // Sync theme with system
      if (data.theme) {
        setTheme(data.theme);
      }

      // Load account settings
      if (user) {
        setAccountSettings((prev) => ({
          ...prev,
          name: user.username || "",
          email: user.email || "",
          profileImage: user.profileImage || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Load from localStorage as fallback
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          console.error("Error parsing saved settings");
        }
      }
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, [token, user, setTheme]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    } else {
      fetchSettings();
    }
  }, [token, router, fetchSettings]);

  // Mark form as dirty when settings change
  useEffect(() => {
    setDirty(true);
  }, [settings, accountSettings]);

  // Handle settings change
  const handleSettingChange = (
    key: string,
    value: string | boolean | number
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };

      // If theme changes, update it immediately
      if (key === "theme") {
        setTheme(value as string);
      }

      return newSettings;
    });
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setIsLoading(true);
      await api.put("/api/settings", settings);

      // Save to localStorage as backup
      localStorage.setItem("userSettings", JSON.stringify(settings));

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });

      setDirty(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Couldn't save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update account settings
  const saveAccountSettings = async () => {
    // Validate passwords match if changing password
    if (accountSettings.newPassword) {
      if (accountSettings.newPassword !== accountSettings.confirmPassword) {
        toast({
          title: "Password Error",
          description: "New passwords don't match.",
          variant: "destructive",
        });
        return;
      }

      if (!accountSettings.oldPassword) {
        toast({
          title: "Password Error",
          description: "Please enter your current password.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsLoading(true);

      // Call API to update account
      await api.put("/api/account", {
        name: accountSettings.name,
        email: accountSettings.email,
        oldPassword: accountSettings.oldPassword,
        newPassword: accountSettings.newPassword,
      });

      // Update local user context
      updateUser({
        username: accountSettings.name,
        email: accountSettings.email,
      });

      // Reset password fields
      setAccountSettings((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      toast({
        title: "Account updated",
        description: "Your account information has been updated successfully.",
      });

      setDirty(false);
    } catch (error: unknown) {
      console.error("Error updating account:", error);

      // Properly narrow down the error type
      let errorMessage = "Couldn't update account. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        // Try to extract error message from API response object
        const errorObj = error as { message?: string; detail?: string };
        errorMessage = errorObj.message || errorObj.detail || errorMessage;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to handle data download
  const downloadUserData = async () => {
    try {
      setIsLoading(true);
      toast({
        title: "Preparing Download",
        description: "Please wait while we gather your data...",
      });

      // Fetch user data
      const userData = await api.get("/api/user/data/export");

      // Convert to JSON string
      const dataStr = JSON.stringify(userData, null, 2);

      // Create download link
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `rockblast_user_data_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(link);

      // Trigger download
      link.click();
      link.remove();

      toast({
        title: "Download Started",
        description: "Your data has been prepared for download",
      });
    } catch (error: unknown) {
      console.error("Error downloading data:", error);
      toast({
        title: "Download Failed",
        description:
          "Couldn't prepare your data for download. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add this useEffect to handle language changes
  useEffect(() => {
    // This is a placeholder - in a real app you would use i18n library
    // Example with next-i18next or similar
    if (settings.language && typeof window !== "undefined") {
      document.documentElement.lang = settings.language;

      // Store language preference
      localStorage.setItem("preferred_language", settings.language);

      // If using i18next
      // i18n.changeLanguage(settings.language);

      // Show toast notification when language changes
      if (isLoaded) {
        toast({
          title: "Language Changed",
          description: `Application language set to: ${
            settings.language === "en"
              ? "English"
              : settings.language === "es"
              ? "Spanish"
              : settings.language === "fr"
              ? "French"
              : settings.language === "de"
              ? "German"
              : settings.language === "hi"
              ? "Hindi"
              : settings.language
          }`,
        });
      }
    }
  }, [settings.language, isLoaded, toast]);

  if (!user) {
    return (
      <div className="container flex items-center justify-center py-32">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          <p className="text-lg">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences and settings
          </p>
        </div>

        {dirty && (
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              onClick={saveSettings}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-8">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
          <TabsTrigger value="general" className="flex gap-2 items-center">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">General</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex gap-2 items-center"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex gap-2 items-center">
            <Monitor className="h-4 w-4" />
            <span className="hidden md:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex gap-2 items-center">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Data & Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex gap-2 items-center">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information and email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={accountSettings.profileImage} />
                  <AvatarFallback>
                    {accountSettings.name?.substring(0, 2).toUpperCase() ||
                      user.username?.substring(0, 2).toUpperCase() ||
                      "RB"}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <h4 className="font-medium">Profile Picture</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the button below to upload a new profile picture
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Upload New Picture
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={accountSettings.name}
                    onChange={(e) =>
                      setAccountSettings({
                        ...accountSettings,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountSettings.email}
                    onChange={(e) =>
                      setAccountSettings({
                        ...accountSettings,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Button onClick={saveAccountSettings} disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates and alerts via email
                    </p>
                  </div>
                 
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange("emailNotifications", checked)
                    }
                    className={`${
                      settings.emailNotifications
                        ? "bg-primary border-primary"
                        : "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    }`}
                  />
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser notifications when results are ready
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange("pushNotifications", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save">Auto-save Results</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save prediction results
                    </p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={settings.autoSave}
                    onCheckedChange={(checked) =>
                      handleSettingChange("autoSave", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how RockBlast looks and behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme-select">Theme</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value) =>
                      handleSettingChange("theme", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language-select">Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) =>
                      handleSettingChange("language", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        English (Fully Supported)
                      </SelectItem>
                      <SelectItem value="es">
                        Spanish (Limited Support)
                      </SelectItem>
                      <SelectItem value="fr">
                        French (Limited Support)
                      </SelectItem>
                      <SelectItem value="de">
                        German (Limited Support)
                      </SelectItem>
                      <SelectItem value="hi">
                        Hindi (Limited Support)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data & Privacy Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data & Export Preferences</CardTitle>
              <CardDescription>
                Manage how your data is stored and exported
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="export-format">Default Export Format</Label>
                  <Select
                    value={settings.dataExportFormat}
                    onValueChange={(value) =>
                      handleSettingChange("dataExportFormat", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select export format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="data-retention">Data Retention Period</Label>
                  <Select
                    value={settings.dataRetention}
                    onValueChange={(value) =>
                      handleSettingChange("dataRetention", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="90days">90 Days</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    How long to keep your prediction data before automatic
                    deletion
                  </p>
                </div>

                <Separator />

                <div className="pt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={downloadUserData}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Download All My Data
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Download a copy of all your prediction data and account
                    information
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password to maintain security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={accountSettings.oldPassword}
                    onChange={(e) =>
                      setAccountSettings({
                        ...accountSettings,
                        oldPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={accountSettings.newPassword}
                    onChange={(e) =>
                      setAccountSettings({
                        ...accountSettings,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={accountSettings.confirmPassword}
                    onChange={(e) =>
                      setAccountSettings({
                        ...accountSettings,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Button onClick={saveAccountSettings} disabled={isLoading}>
                {isLoading ? "Updating..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button variant="destructive" className="w-full sm:w-auto">
                  Sign Out From All Devices
                </Button>

                <Separator />

                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                  >
                    Delete Account
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Permanently delete your account and all associated data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
