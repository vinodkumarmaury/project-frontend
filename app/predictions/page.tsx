'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { v4 as uuidv4 } from 'uuid';
import { api } from '@/lib/api';

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

export default function PredictionsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PredictionResults | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null); // Store the current prediction ID
  const { user, token } = useAuth();
  const router = useRouter();

  // Function to generate default test data
  function getDefaultRockData() {
    return {
      id: uuidv4(),
      Rock_Type: "Granite",
      "Rock_Density (kg/m³)": 2700,
      "UCS (MPa)": 120,
      "Rock_Elastic_Modulus (GPa)": 50,
      "Fracture_Frequency (/m)": 2.5,
      "Hole_Diameter (mm)": 90,
      "Charge_Length (m)": 6,
      "Stemming_Length (m)": 3,
      Explosive_Type: "ANFO",
      "Blast_Pattern_Spacing (m)": 4,
      "Delay_Timing (ms)": 25,
      "Powder_Factor (kg/m³)": 0.5,
      Weathering_Degree: 0.2,
      "Groundwater_Level (m)": 5,
      "Blast_Vibration_PPV (mm/s)": 10,
      "Fragmentation_Size (cm)": 20,
      "Blasting_Cost ($/tonne)": 0.8,
      "Penetration_Rate (m/min)": 1.5,
      "Bench_Height (m)": 10,
      Stemming_Material: "Drill Cuttings",
      Water_Log_Status: "Dry",
      "Vibration_Level (dB)": 90,
      "Noise_Level (dB)": 100,
      "Explosive_Weight (kg)": 120,
      "Burden (m)": 3,
      "Spacing (m)": 3.5,
      "Stemming (m)": 3,
      "SubDrilling (m)": 0.5,
      "Rock_Volume (m³)": 100
    };
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access predictions",
        variant: "destructive",
      });
      router.push('/sign-in');
    }
  }, [token, router, toast]);

  const rockTypes = ['Granite', 'Limestone', 'Sandstone', 'Basalt', 'Shale', 'Coal', 'Iron'];
  const explosiveTypes = ['ANFO', 'Emulsion', 'Slurry'];
  const stemmingMaterials = ['Fine particle of same Ore', 'Angular Rock', 'Sand', 'Gravel'];
  const waterLogStatus = ['Dry', 'Wet', 'Partially Wet'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make predictions",
        variant: "destructive",
      });
      router.push('/sign-in');
      return;
    }
    
    setLoading(true);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      // Use custom ID if provided, otherwise generate a random one
      const customId = formData.get('custom_id') as string;
      const idToUse = customId && customId.trim() ? customId.trim() : uuidv4();
      setPredictionId(idToUse);
      
      // Use this ID in the requestData
      const requestData = {
        id: idToUse,
        Rock_Type: formData.get('Rock_Type') || '',
        "Rock_Density (kg/m³)": parseFloat(formData.get('Rock_Density') as string) || 0,
        "UCS (MPa)": parseFloat(formData.get('UCS') as string) || 0,
        "Rock_Elastic_Modulus (GPa)": parseFloat(formData.get('Rock_Elastic_Modulus') as string) || 0,
        "Fracture_Frequency (/m)": parseFloat(formData.get('Fracture_Frequency') as string) || 0,
        "Hole_Diameter (mm)": parseFloat(formData.get('Hole_Diameter') as string) || 0,
        "Charge_Length (m)": parseFloat(formData.get('Charge_Length') as string) || 0,
        "Stemming_Length (m)": parseFloat(formData.get('Stemming_Length') as string) || 0,
        Explosive_Type: formData.get('Explosive_Type') || '',
        "Blast_Pattern_Spacing (m)": parseFloat(formData.get('Blast_Pattern_Spacing') as string) || 0,
        "Delay_Timing (ms)": parseFloat(formData.get('Delay_Timing') as string) || 0,
        "Powder_Factor (kg/m³)": 0, // Default value for prediction
        Weathering_Degree: parseFloat(formData.get('Weathering_Degree') as string) || 0,
        "Groundwater_Level (m)": parseFloat(formData.get('Groundwater_Level') as string) || 0,
        "Blast_Vibration_PPV (mm/s)": 0, // Default value for non-input field
        "Fragmentation_Size (cm)": 0, // Will be predicted
        "Blasting_Cost ($/tonne)": 0, // Default value for non-input field
        "Penetration_Rate (m/min)": parseFloat(formData.get('Penetration_Rate') as string) || 0,
        "Bench_Height (m)": parseFloat(formData.get('Bench_Height') as string) || 10,
        Stemming_Material: formData.get('Stemming_Material') || '',
        Water_Log_Status: formData.get('Water_Log_Status') || '',
        "Vibration_Level (dB)": 0, // Will be predicted
        "Noise_Level (dB)": 0, // Will be predicted
        "Explosive_Weight (kg)": parseFloat(formData.get('Explosive_Weight') as string) || 0,
        "Burden (m)": parseFloat(formData.get('Burden') as string) || 0,
        "Spacing (m)": parseFloat(formData.get('Spacing') as string) || 0,
        "Stemming (m)": parseFloat(formData.get('Stemming_Length') as string) || 0, // Reuse stemming length
        "SubDrilling (m)": parseFloat(formData.get('SubDrilling') as string ) || 0,
        "Hole_Depth (m)": parseFloat(formData.get('Hole_Depth') as string) || 0,
        "Air_Overpressure (Pa)": parseFloat(formData.get('Air_Overpressure') as string) || 0,
        "Rock_Volume (m³)": parseFloat(formData.get('Rock_Volume') as string) || 0
      };

      console.log("Sending prediction request with data:", requestData);

      const result = await api.post('/api/predict', requestData);
      setResults(result.result);
      
      // Store prediction ID in localStorage
      const savedPredictions = JSON.parse(localStorage.getItem('predictions') || '[]');
      savedPredictions.unshift({
        id: idToUse,
        timestamp: new Date().toISOString(),
        rockType: formData.get('Rock_Type') || '',
        customId: customId && customId.trim() ? true : false
      });
      // Keep only the last 10 predictions
      localStorage.setItem('predictions', JSON.stringify(savedPredictions.slice(0, 10)));
      
      toast({
        title: 'Success',
        description: 'Prediction completed successfully',
      });
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get prediction',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a function to copy ID to clipboard
  const copyIdToClipboard = useCallback(() => {
    if (predictionId) {
      navigator.clipboard.writeText(predictionId);
      toast({
        title: "ID Copied",
        description: "Prediction ID copied to clipboard",
      });
    }
  }, [predictionId, toast]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Please sign in to access predictions</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Rock Blasting Prediction</h1>
        <p className="text-muted-foreground">
          Enter your rock blasting parameters to get predictions for fragmentation size, vibration levels, and noise levels.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Prediction Reference */}
              <div className="space-y-4">
                <h3 className="font-semibold">Prediction Reference</h3>
                <div className="space-y-2">
                  <label htmlFor="custom-id">Custom ID (optional)</label>
                  <Input 
                    id="custom-id" 
                    name="custom_id" 
                    placeholder="Enter a memorable ID (e.g., site1-test2)" 
                  />
                  <p className="text-sm text-muted-foreground">
                    You can provide your own ID to easily retrieve this prediction later.
                    If left empty, a random ID will be generated.
                  </p>
                </div>
              </div>

              {/* Rock Properties */}
              <div className="space-y-4">
                <h3 className="font-semibold">Rock Properties</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="rock-type">Rock Type</label>
                    <Select name="Rock_Type" required>
                      <SelectTrigger id="rock-type">
                        <SelectValue placeholder="Select rock type" />
                      </SelectTrigger>
                      <SelectContent>
                        {rockTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="rock-density">Rock Density (kg/m³)</label>
                    <Input 
                      id="rock-density" 
                      type="number" 
                      name="Rock_Density" 
                      step="0.01" 
                      placeholder="0.00" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="ucs">UCS (MPa)</label>
                    <Input 
                      id="ucs" 
                      type="number" 
                      name="UCS" 
                      step="0.01" 
                      placeholder="0.00" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="elastic-modulus">Elastic Modulus (GPa)</label>
                    <Input 
                      id="elastic-modulus" 
                      type="number" 
                      name="Rock_Elastic_Modulus" 
                      step="0.01" 
                      placeholder="0.00" 
                      required 
                    />
                  </div>
                    <div className="space-y-2">
                    <label htmlFor="fracture-frequency">Fracture Frequency (/m)</label>
                    <Input 
                      id="fracture-frequency" 
                      type="number" 
                      name="Fracture_Frequency" 
                      step="0.01" 
                      placeholder="0.0" 
                      required 
                    />
                    </div>
                  {/* <div className="space-y-2">
                    <label htmlFor="weathering-degree">Weathering Degree</label>
                    <Input id="weathering-degree" type="number" name="Weathering_Degree" required min="0" max="1" step="0.1" />
                  </div> */}
                </div>
              </div>

              {/* Blast Design Parameters */}
              <div className="space-y-4">
                <h3 className="font-semibold">Blast Design Parameters</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="hole-diameter">No. of Hole</label>
                    <Input id="no-of-hole" type="number" name="No_Hole" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="hole-diameter">Hole Diameter (mm)</label>
                    <Input 
                      id="hole-diameter" 
                      type="number" 
                      name="Hole_Diameter" 
                      step="0.01" 
                      placeholder="0.00" 
                      required 
                    />
                  </div>
                    <div className="space-y-2">
                    <label htmlFor="charge-length">Charge Length (m)</label>
                    <Input 
                      id="charge-length" 
                      type="number" 
                      name="Charge_Length" 
                      step="0.01" 
                      placeholder="0.00" 
                      required 
                    />
                    </div>
                    <div className="space-y-2">
                    <label htmlFor="stemming-length">Stemming Length (m)</label>
                    <Input 
                      id="stemming-length" 
                      type="number" 
                      name="Stemming_Length" 
                      step="0.01" 
                      placeholder="0.00" 
                      required 
                    />
                    </div>
                  <div className="space-y-2">
                    <label htmlFor="explosive-type">Explosive Type</label>
                    <Select name="Explosive_Type" required>
                      <SelectTrigger id="explosive-type">
                        <SelectValue placeholder="Select explosive type" />
                      </SelectTrigger>
                      <SelectContent>
                        {explosiveTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <div className="space-y-2">
                    <label htmlFor="pattern-spacing">Pattern Spacing (m)</label>
                    <Input id="pattern-spacing" type="number" name="Blast_Pattern_Spacing" required />
                  </div> */}
                  <div className="space-y-2">
                    <label htmlFor="delay-timing">Delay Timing (ms)</label>
                    <Input 
                      id="delay-timing" 
                      type="number" 
                      name="Delay_Timing" 
                      step="0.01" 
                      placeholder="0.00"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="explosive-weight">Explosive Weight (kg) per Hole</label>
                    <Input 
                      id="explosive-weight" 
                      type="number" 
                      name="Explosive_Weight" 
                      step="0.01" 
                      placeholder="0.00"
                      required 
                    />
                  </div>
                    <div className="space-y-2">
                    <label htmlFor="burden">Burden (m)</label>
                    <Input 
                      id="burden" 
                      type="number" 
                      name="Burden" 
                      step="0.01" 
                      placeholder="0.00" 
                      required 
                    />
                    </div>
                    <div className="space-y-2">
                    <label htmlFor="spacing">Spacing (m)</label>
                    <Input 
                      id="spacing" 
                      type="number" 
                      name="Spacing" 
                      step="0.01" 
                      placeholder="0.00" 
                      required 
                    />
                    </div>
                    <div className="space-y-2">
                    <label htmlFor="sub-drilling">Sub-Drilling (m)</label>
                    <Input 
                      id="sub-drilling" 
                      type="number" 
                      name="SubDrilling" 
                      step="0.01" 
                      placeholder="0.00" 
                      required 
                      defaultValue="0.5" 
                    />
                    </div>
                    <div className="space-y-2">
                    <label htmlFor="hole-depth">Hole Depth (m)</label>
                    <Input 
                      id="hole-depth" 
                      type="number" 
                      name="Hole_Depth" 
                      step="0.01" 
                      placeholder="0.00" 
                      required 
                    />
                    </div>
                  <div className="space-y-2">
                    <label htmlFor="stemming-material">Stemming Material</label>
                    <Select name="Stemming_Material" required>
                      <SelectTrigger id="stemming-material">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {stemmingMaterials.map((material) => (
                          <SelectItem key={material} value={material}>
                            {material}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Environmental and Additional Parameters */}
              <div className="space-y-4">
                <h3 className="font-semibold">Environmental & Additional Parameters</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* <div className="space-y-2">
                    <label htmlFor="groundwater-level">Groundwater Level (m)</label>
                    <Input id="groundwater-level" type="number" name="Groundwater_Level" required />
                  </div> */}
                  <div className="space-y-2">
                    <label htmlFor="water-log-status">Water Log Status</label>
                    <Select name="Water_Log_Status" required>
                      <SelectTrigger id="water-log-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {waterLogStatus.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <div className="space-y-2">
                    <label htmlFor="penetration-rate">Penetration Rate (m/min)</label>
                    <Input id="penetration-rate" type="number" name="Penetration_Rate" required defaultValue="1.5" />
                  </div> */}
                  {/* <div className="space-y-2">
                    <label htmlFor="bench-height">Bench Height (m)</label>
                    <Input id="bench-height" type="number" name="Bench_Height" required defaultValue="10" />
                  </div> */}
                  {/* <div className="space-y-2">
                    <label htmlFor="rock-volume">Rock Volume (m³)</label>
                    <Input id="rock-volume" type="number" name="Rock_Volume" required defaultValue="100" />
                  </div> */}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-4"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const defaultData = getDefaultRockData();
                      console.log("Testing with default data:", defaultData);
                      const result = await api.post('/api/predict', defaultData);
                      setResults(result.result);
                      toast({
                        title: 'Test Successful',
                        description: 'Prediction with default data worked!',
                      });
                    } catch (error) {
                      console.error('Test prediction error:', error);
                      toast({
                        title: 'Test Error',
                        description: error instanceof Error ? error.message : 'Test failed',
                        variant: 'destructive',
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Test with Default Values
                </Button>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Calculating...' : 'Get Prediction'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
          </CardHeader>
          <CardContent>
            {results ? (
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
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Enter parameters and submit to see predictions</p>
              </div>
            )}
          </CardContent>
        </Card>

        {predictionId && results && (
          <Card className="col-span-2 mt-6">
            <CardHeader>
              <CardTitle>Prediction ID Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md mb-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm break-all">{predictionId}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyIdToClipboard}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy ID
                  </Button>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Save this ID to retrieve your prediction details in the future from the history page.
              </p>
              <Link href={`/predictions/history?id=${predictionId}`}>
                <Button variant="outline" className="w-full">
                  View in History Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}