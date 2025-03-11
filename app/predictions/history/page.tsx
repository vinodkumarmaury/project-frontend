'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { Search, Copy, Download } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import * as XLSX from 'xlsx';

interface PredictionResults {
  input_data: Record<string, any>;
  predictions: {
    'Fragmentation_Size (cm)'?: {
      SVR: number;
      XGBoost: number;
      'Random Forest': number;
    };
    'Vibration_Level (dB)'?: {
      SVR: number;
      XGBoost: number;
      'Random Forest': number;
    };
    'Noise_Level (dB)'?: {
      SVR: number;
      XGBoost: number;
      'Random Forest': number;
    };
    'Powder_Factor'?: {
      SVR: number;
      XGBoost: number;
      'Random Forest': number;
    };
  };
  result?: any; // Add this to fix the result property error
}

export default function PredictionHistoryPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [predictionId, setPredictionId] = useState("");
  const [results, setResults] = useState<PredictionResults | null>(null);
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recentPredictions, setRecentPredictions] = useState<{id: string, timestamp: string, rockType: string, customId?: boolean}[]>([]);
  
  // Add this to your state
  const [userSettings, setUserSettings] = useState({
    dataExportFormat: 'json' // Default
  });
  
  // Extract the API fetch into a separate function so we can call it from useEffect
  const handleFetch = useCallback(async (id: string) => {
    if (!id.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prediction ID",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const result = await api.getPredictionById(id);
      console.log("API response for prediction:", result);
      
      if (result.result) {
        setResults(result.result);
      } else {
        setResults(result as PredictionResults);
      }
      
      toast({
        title: 'Success',
        description: 'Prediction data retrieved successfully',
      });
    } catch (error) {
      console.error('Error fetching prediction:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to retrieve prediction',
        variant: 'destructive',
      });
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [toast]); // Add dependencies
  
  // Get ID from URL if present
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setPredictionId(idFromUrl);
      handleFetch(idFromUrl);
    }
    
    // Load recent predictions from localStorage
    const savedPredictions = JSON.parse(localStorage.getItem('predictions') || '[]');
    setRecentPredictions(savedPredictions);
  }, [searchParams, handleFetch]); // Add handleFetch as dependency
  
  // Add this effect to fetch user settings
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!token) return;
      
      try {
        const settings = await api.get('/api/settings');
        if (settings && settings.dataExportFormat) {
          setUserSettings(settings);
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
      }
    };
    
    fetchUserSettings();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleFetch(predictionId);
  };

  const copyIdToClipboard = () => {
    if (predictionId) {
      navigator.clipboard.writeText(predictionId);
      toast({
        title: "ID Copied",
        description: "Prediction ID copied to clipboard",
      });
    }
  };

  const exportData = (format: string) => {
    if (!results) return;
  
    try {
      const inputData = results.input_data || {};
      const predictions = results.predictions || {};
      
      if (format === 'json') {
        // Export as JSON
        const jsonData = JSON.stringify({
          input_data: inputData,
          predictions
        }, null, 2);
        
        // Create download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rock-prediction-${predictionId}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Export Successful',
          description: 'Data exported as JSON',
        });
      } 
      else if (format === 'csv') {
        // Flatten prediction data
        const flatPredictions: Record<string, string> = {};
        
        Object.entries(predictions).forEach(([metric, models]) => {
          Object.entries(models as Record<string, number>).forEach(([model, value]) => {
            flatPredictions[`${metric} (${model})`] = value.toString();
          });
        });
        
        // Combine all data
        const allData = { ...inputData, ...flatPredictions };
        
        // Create CSV content
        const headers = Object.keys(allData).join(',');
        const values = Object.values(allData).join(',');
        const csvContent = `${headers}\n${values}`;
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rock-prediction-${predictionId}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Export Successful',
          description: 'Data exported as CSV',
        });
      }
      else if (format === 'excel') {
        // Flatten prediction data
        const flatPredictions: Record<string, string | number> = {};
        
        Object.entries(predictions).forEach(([metric, models]) => {
          Object.entries(models as Record<string, number>).forEach(([model, value]) => {
            flatPredictions[`${metric} (${model})`] = value;
          });
        });
        
        // Combine all data 
        const allData = { ...inputData, ...flatPredictions };
        
        // Create worksheet
        const ws = XLSX.utils.json_to_sheet([allData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Prediction");
        
        // Generate Excel file and download
        XLSX.writeFile(wb, `rock-prediction-${predictionId}.xlsx`);
        
        toast({
          title: 'Export Successful',
          description: 'Data exported as Excel',
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'An error occurred during export',
        variant: 'destructive',
      });
    }
  };

  // Protect the route
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Please sign in to access prediction history</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 container mx-auto px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Prediction History</h1>
        <p className="text-muted-foreground">
          View previous prediction results by entering a prediction ID
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter prediction ID"
                className="flex-1"
                value={predictionId}
                onChange={(e) => setPredictionId(e.target.value)}
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Searching...' : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Find
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="flex justify-center items-center my-4">
        {loading && <p className="text-blue-500">Loading data...</p>}
        {!loading && predictionId && !results && <p className="text-red-500">No data found for ID: {predictionId}</p>}
      </div>

      {/* Recent Predictions Section */}
      {recentPredictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Rock Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPredictions.map((prediction) => (
                    <TableRow key={prediction.id}>
                      <TableCell className="font-mono text-xs">
                        {prediction.customId ? prediction.id : 
                          `${prediction.id.substring(0, 8)}...${prediction.id.substring(prediction.id.length - 4)}`}
                      </TableCell>
                      <TableCell>{prediction.rockType}</TableCell>
                      <TableCell>
                        {new Date(prediction.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setPredictionId(prediction.id);
                            handleFetch(prediction.id);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Results Display */}
      {results && (
        <div className="space-y-6">
          {/* ID Reference Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Prediction ID</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyIdToClipboard}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy ID
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md">
                <p className="font-mono break-all">{predictionId}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  onClick={() => exportData(userSettings.dataExportFormat)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportData('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData('excel')}>
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Input Parameters Card */}
          <Card>
            <CardHeader>
              <CardTitle>Input Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                // This IIFE helps us use complex logic in JSX
                const inputData = results?.input_data || results as Record<string, any>;
                
                if (!inputData || typeof inputData !== 'object') {
                  return <p className="text-red-500">No input data available</p>;
                }
                
                return (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parameter</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(inputData)
                          .filter(([key]) => {
                            // Fields to exclude from input parameters
                            const excludedFields = [
                              '_id', 
                              'id',
                              'Powder_Factor',
                              'Powder_Factor (kg/m³)',
                              'Fragmentation_Size (cm)',
                              'Vibration_Level (dB)',
                              'Noise_Level (dB)',
                              'Blasting_Cost ($/tonne)'
                            ];
                            
                            // Also exclude any key that contains "SVR", "XGBoost", or "RandomForest"
                            const isPredictionModel = key.includes('SVR') || 
                                                     key.includes('XGBoost') || 
                                                     key.includes('RandomForest');
                            
                            // Return true to keep, false to filter out
                            return !excludedFields.includes(key) && !isPredictionModel;
                          })
                          .map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell className="font-medium">{key}</TableCell>
                              <TableCell>
                                {typeof value === 'number' ? value.toString() : 
                                 value === null ? 'N/A' : 
                                 typeof value === 'object' ? JSON.stringify(value) : 
                                 String(value)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Prediction Results Card */}
          <Card>
            <CardHeader>
              <CardTitle>Prediction Results</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                // Check all possible locations for prediction data based on API response structure
                const predictions = results?.predictions || 
                                  (results?.result && (results.result as any).predictions) ||
                                  {};
                
                // If predictions are embedded in the input_data
                const inputData = results?.input_data || results as Record<string, any>;
                const predictionFields = ['Fragmentation_Size (cm)', 'Vibration_Level (dB)', 'Noise_Level (dB)', 'Powder_Factor'];
                
                // Construct prediction data manually if needed
                const manualPredictions: Record<string, { SVR: number; XGBoost: number; 'Random Forest': number }> = {};
                let foundManualPredictions = false;
                
                predictionFields.forEach(field => {
                  // Look for SVR, XGBoost, RandomForest variants
                  const svr = inputData[`SVR_${field}`] || inputData[`${field}_SVR`];
                  const xgboost = inputData[`XGBoost_${field}`] || inputData[`${field}_XGBoost`];
                  const randomForest = inputData[`RandomForest_${field}`] || inputData[`${field}_RandomForest`];
                  
                  if (svr !== undefined || xgboost !== undefined || randomForest !== undefined) {
                    foundManualPredictions = true;
                    manualPredictions[field] = {
                      "SVR": svr !== undefined ? parseFloat(svr) : 0,
                      "XGBoost": xgboost !== undefined ? parseFloat(xgboost) : 0,
                      "Random Forest": randomForest !== undefined ? parseFloat(randomForest) : 0
                    };
                  }
                });
                
                // Use manual predictions if found and no structured predictions exist
                const predictionData = Object.keys(predictions).length > 0 ? 
                                      predictions : 
                                      (foundManualPredictions ? manualPredictions : null);
                
                if (!predictionData) {
                  // Add more diagnostic info
                  console.error("No prediction data found in:", results);
                  return (
                    <div className="space-y-4">
                      <p className="text-amber-500">No prediction results found in the API response.</p>
                      <p className="text-sm text-muted-foreground">
                        The API response may not include prediction data in the expected format.
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-6">
                    {Object.entries(predictionData).map(([metric, models]) => {
                      // Skip if not an object with model predictions
                      if (typeof models !== 'object' || models === null) return null;
                      
                      return (
                        <div key={metric} className="space-y-2">
                          <h3 className="font-semibold">{metric}</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Model</TableHead>
                                <TableHead className="text-right">Prediction</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(models as Record<string, any>).map(([model, value]) => (
                                <TableRow key={model}>
                                  <TableCell>{model}</TableCell>
                                  <TableCell className="text-right">
                                    {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}