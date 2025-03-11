'use client';

import { useState } from 'react';
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
import { Search } from "lucide-react";
import { useRouter } from 'next/navigation';

interface PredictionResults {
  input_data: any;
  predictions: {
    'Fragmentation_Size (cm)': {
      SVR: number;
      XGBoost: number;
      'Random Forest': number;
    };
    'Vibration_Level (dB)': {
      SVR: number;
      XGBoost: number;
      'Random Forest': number;
    };
    'Noise_Level (dB)': {
      SVR: number;
      XGBoost: number;
      'Random Forest': number;
    };
    'Powder_Factor': {
      SVR: number;
      XGBoost: number;
      'Random Forest': number;
    };
  };
}

export default function PredictionHistoryPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [predictionId, setPredictionId] = useState("");
  const [results, setResults] = useState<PredictionResults | null>(null);
  const { user, token } = useAuth();
  const router = useRouter();

  // Protect the route
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Please sign in to access prediction history</p>
      </div>
    );
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!predictionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prediction ID",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const result = await api.get(`/api/data/${predictionId}`);
      setResults(result);
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
  };

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

      {results && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(results.input_data)
                      .filter(([key]) => key !== 'id')
                      .map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{key}</TableCell>
                          <TableCell>{value as string}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prediction Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(results.predictions).map(([metric, models]) => (
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
                        {Object.entries(models).map(([model, value]) => (
                          <TableRow key={model}>
                            <TableCell>{model}</TableCell>
                            <TableCell className="text-right">{value.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}