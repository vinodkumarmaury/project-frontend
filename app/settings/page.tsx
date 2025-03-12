"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// At the top of your settings page
const applyLanguage = (lang: string) => {
  document.documentElement.lang = lang;
  localStorage.setItem("preferred_language", lang);

  // Apply any language-specific text (simplified example)
  const translations: Record<string, Record<string, string>> = {
    en: {
      settings: "Settings",
      profile: "Profile",
      notifications: "Notifications",
      appearance: "Appearance",
      security: "Security",
      data: "Data & Privacy",
    },
    es: {
      settings: "Configuración",
      profile: "Perfil",
      notifications: "Notificaciones",
      appearance: "Apariencia",
      security: "Seguridad",
      data: "Datos y Privacidad",
    },
    // Add more languages as needed
  };

  // Remove toast notification from here since we have it in useEffect
};

export default function SettingsPage() {
  const { user, token, logout, updateUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [dirty, setDirty] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const originalSettings = useRef<typeof settings | null>(null);
  const originalAccountSettings = useRef<typeof accountSettings | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const initialLoadComplete = useRef(false);

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

      // Store original settings
      originalSettings.current = { ...data };

      // Sync theme with system
      if (data.theme) {
        setTheme(data.theme);
      }

      // Load account settings
      if (user) {
        const accountData = {
          name: user.username || "",
          email: user.email || "",
          profileImage: user.profileImage || "",
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        };

        setAccountSettings(accountData);
        // Store original account settings
        originalAccountSettings.current = { ...accountData };
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Load from localStorage as fallback
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          originalSettings.current = { ...parsedSettings };
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

  // Improve the change detection useEffect
  useEffect(() => {
    if (!originalSettings.current || !originalAccountSettings.current) {
      return;
    }

    // Check if settings have changed
    let settingsChanged = false;
    const settingsKeys = Object.keys(settings) as (keyof typeof settings)[];
    for (const key of settingsKeys) {
      if (settings[key] !== originalSettings.current?.[key]) {
        settingsChanged = true;
        break;
      }
    }

    // Check if account settings have changed (excluding passwords which are always different)
    let accountChanged =
      accountSettings.name !== originalAccountSettings.current.name ||
      accountSettings.email !== originalAccountSettings.current.email;

    // Password change detection (only if user started typing a new password)
    let passwordChanged =
      accountSettings.newPassword !== "" ||
      accountSettings.oldPassword !== "" ||
      accountSettings.confirmPassword !== "";

    setDirty(settingsChanged || accountChanged || passwordChanged);
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

      // If language changes, apply it immediately
      if (key === "language") {
        applyLanguage(value as string);
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

      // Update original settings reference after successful save
      originalSettings.current = { ...settings };

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

      // Change this API call to match your existing backend endpoint
      await api.put("/api/update-profile", {
        username: accountSettings.name,
        email: accountSettings.email,
        password: accountSettings.oldPassword, // Note: backend expects current password here
        firstName: user?.firstName || "", // Include optional fields
        lastName: user?.lastName || "",
      });

      // Update local user context
      updateUser({
        username: accountSettings.name,
        email: accountSettings.email,
      });

      // Create updated account settings without passwords
      const updatedAccountSettings = {
        name: accountSettings.name,
        email: accountSettings.email,
        profileImage: accountSettings.profileImage,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      };

      // Update state with empty password fields
      setAccountSettings(updatedAccountSettings);

      // Update original reference with the new values
      originalAccountSettings.current = { ...updatedAccountSettings };

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

  // Updated downloadUserData function to include all parameters and results
  const downloadUserData = async () => {
    try {
      setIsLoading(true);
      toast({
        title: "Preparing Download",
        description: "Please wait while we gather your data...",
      });

      // Fetch user data
      const userData = await api.get("/api/user/data/export");

      // Format data based on selected format
      let dataContent;
      let mimeType;
      let fileExtension;

      if (settings.dataExportFormat === "csv" || settings.dataExportFormat === "excel") {
        // Convert JSON to CSV
        const csvRows = [];
        
        // Add user data section
        if (userData.user) {
          csvRows.push(`# User Information`);
          csvRows.push(Object.keys(userData.user).join(','));
          csvRows.push(Object.values(userData.user).map(val => `"${val}"`).join(','));
          csvRows.push('\n');
        }
        
        // Add settings section
        if (userData.settings) {
          csvRows.push(`# User Settings`);
          csvRows.push(Object.keys(userData.settings).join(','));
          csvRows.push(Object.values(userData.settings).map(val => `"${val}"`).join(','));
          csvRows.push('\n');
        }
        
        // Add predictions section with ALL parameters
        if (userData.predictions && userData.predictions.length > 0) {
          csvRows.push(`# Prediction Data`);
          
          // Get all possible keys from all predictions
          const allPredictionKeys = new Set();
          userData.predictions.forEach((pred: Record<string, any>) => {
            Object.keys(pred).forEach(key => allPredictionKeys.add(key));
          });
          
          // Convert to array and sort for consistent order
          const predictionKeys = Array.from(allPredictionKeys).sort();
          
          // Add headers
          csvRows.push(predictionKeys.join(','));
          
          // Add each prediction with all its parameters
          userData.predictions.forEach((pred: Record<string, any>) => {
            const row = (predictionKeys as string[]).map((key: string) => {
              // Handle missing values
              if (!(key in pred)) return '';
              
              // Format values appropriately
              const val = pred[key];
              if (val === null || val === undefined) return '';
              if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
              return `"${String(val).replace(/"/g, '""')}"`;
            });
            
            csvRows.push(row.join(','));
          });
        }
        
        dataContent = csvRows.join("\n");
        mimeType = settings.dataExportFormat === "csv" ? "text/csv" : "application/vnd.ms-excel";
        fileExtension = settings.dataExportFormat === "csv" ? "csv" : "xls";
      } else {
        // Default JSON format - already includes all data
        dataContent = JSON.stringify(userData, null, 2);
        mimeType = "application/json";
        fileExtension = "json";
      }

      // Create download link
      const dataBlob = new Blob([dataContent], { type: mimeType });
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `rockblast_user_data_${new Date().toISOString().slice(0, 10)}.${fileExtension}`
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
        description: "Couldn't prepare your data for download. Please try again.",
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
      if (isLoaded && initialLoadComplete.current) {
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

      // Mark initial load as complete after the first render
      if (isLoaded && !initialLoadComplete.current) {
        initialLoadComplete.current = true;
      }
    }
  }, [settings.language, isLoaded, toast]);

  // Add a cancel function to reset changes
  const cancelChanges = () => {
    // Reset settings to original values
    if (originalSettings.current) {
      setSettings({ ...originalSettings.current });
    }

    // Reset account settings to original values
    if (originalAccountSettings.current) {
      setAccountSettings({ ...originalAccountSettings.current });
    }

    setDirty(false);

    toast({
      title: "Changes Discarded",
      description: "Your changes have been discarded.",
    });
  };

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

            <Button variant="outline" onClick={cancelChanges} className="gap-2">
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

                  {/* Improved Switch component with better visibility */}
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
                    onClick={(e) => {
                      // Prevent event propagation to avoid triggering dirty state check
                      e.stopPropagation();
                      downloadUserData();
                    }}
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
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto"
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      await api.post("/api/logout/all-devices", {});
                      toast({
                        title: "Success",
                        description: "Signed out from all devices successfully",
                      });
                      // Sign out current session too
                      logout();
                      router.push("/sign-in");
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to sign out from all devices",
                        variant: "destructive",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  Sign Out From All Devices
                </Button>

                <Separator />

                <div className="pt-2">
                  <AlertDialog
                    open={showDeleteConfirm}
                    onOpenChange={setShowDeleteConfirm}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-destructive border-destructive hover:bg-destructive/10"
                      >
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account and remove
                          your data from our servers. This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                          onClick={async () => {
                            try {
                              await api.delete("/api/account");
                              toast({
                                title: "Account Deleted",
                                description:
                                  "Your account has been permanently deleted.",
                              });
                              logout();
                              router.push("/");
                            } catch (error) {
                              toast({
                                title: "Error",
                                description:
                                  "Failed to delete account. Please try again.",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

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
