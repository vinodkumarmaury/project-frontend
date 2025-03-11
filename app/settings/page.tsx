'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [settings, setSettings] = useState({
    emailNotifications: false,
    pushNotifications: false,
    language: 'en',
    theme: 'system',
    dataExportFormat: 'csv'
  });

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const data = await api.get('/api/settings');
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      router.push('/sign-in');
    } else {
      fetchSettings();
    }
  }, [token, router, fetchSettings]);

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      await api.put('/api/settings', settings);
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving settings' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="container py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-600' 
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="language-select" className="text-sm font-medium">Language</label>
              <select
                id="language-select"
                aria-label="Select language"
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="theme-select" className="text-sm font-medium">Theme</label>
              <select
                id="theme-select"
                aria-label="Select theme"
                value={settings.theme}
                onChange={(e) => setSettings({...settings, theme: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Data Export</h2>
          <div className="space-y-2">
            <label htmlFor="export-format-select" className="text-sm font-medium">Default Export Format</label>
            <select
              id="export-format-select"
              aria-label="Select export format"
              value={settings.dataExportFormat}
              onChange={(e) => setSettings({...settings, dataExportFormat: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="json">JSON</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button 
            onClick={saveSettings}
            disabled={isLoading}
            className="w-32"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.push('/')}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}