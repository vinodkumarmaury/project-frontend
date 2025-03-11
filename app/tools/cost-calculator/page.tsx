'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Calculator } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';

export default function BlastingCostCalculatorPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Form states
  const [rockDensity, setRockDensity] = useState<number>(2600);
  const [rockVolume, setRockVolume] = useState<number>(1000);
  const [explosiveCost, setExplosiveCost] = useState<number>(1.2);
  const [explosiveWeight, setExplosiveWeight] = useState<number>(500);
  const [drillingCost, setDrillingCost] = useState<number>(10);
  const [drillingMeters, setDrillingMeters] = useState<number>(200);
  const [laborCost, setLaborCost] = useState<number>(500);
  const [equipmentCost, setEquipmentCost] = useState<number>(800);
  const [detonatorCost, setDetonatorCost] = useState<number>(15);
  const [detonatorCount, setDetonatorCount] = useState<number>(20);
  const [accessoriesCost, setAccessoriesCost] = useState<number>(200);

  const calculateCost = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate tons of rock
      const rockTonnage = (rockDensity * rockVolume) / 1000; // Convert kg to tonnes
      
      // Calculate component costs
      const explosiveTotal = explosiveCost * explosiveWeight;
      const drillingTotal = drillingCost * drillingMeters;
      const detonatorTotal = detonatorCost * detonatorCount;
      
      // Calculate total cost and cost per tonne
      const totalCost = explosiveTotal + drillingTotal + laborCost + equipmentCost + detonatorTotal + accessoriesCost;
      const costPerTonne = totalCost / rockTonnage;
      
      // Prepare results
      const resultsData = {
        rockTonnage: rockTonnage.toFixed(2),
        explosiveTotal: explosiveTotal.toFixed(2),
        drillingTotal: drillingTotal.toFixed(2),
        detonatorTotal: detonatorTotal.toFixed(2),
        laborCost: laborCost.toFixed(2),
        equipmentCost: equipmentCost.toFixed(2),
        accessoriesCost: accessoriesCost.toFixed(2),
        totalCost: totalCost.toFixed(2),
        costPerTonne: costPerTonne.toFixed(2),
      };
      
      setResults(resultsData);
      toast({
        title: 'Calculation Complete',
        description: 'Blasting cost calculation completed successfully',
      });
    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to calculate blasting cost',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    
    try {
      // Create CSV content
      const csvContent = `
Parameter,Value
Rock Tonnage (tonnes),${results.rockTonnage}
Explosive Cost ($),${results.explosiveTotal}
Drilling Cost ($),${results.drillingTotal}
Detonator Cost ($),${results.detonatorTotal}
Labor Cost ($),${results.laborCost}
Equipment Cost ($),${results.equipmentCost}
Accessories Cost ($),${results.accessoriesCost}
Total Cost ($),${results.totalCost}
Cost per Tonne ($/tonne),${results.costPerTonne}
`.trim();
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'blasting-cost-calculation.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export Successful',
        description: 'Blasting cost data exported as CSV',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'An error occurred during export',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Blasting Cost Calculator</h1>
        <p className="text-muted-foreground">
          Calculate the cost per tonne for your blasting operation
        </p>
      </div>

      <div className="grid gap-6 mt-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calculation Parameters</CardTitle>
            <CardDescription>
              Enter the parameters of your blasting operation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={calculateCost} className="space-y-6">
              <Tabs defaultValue="rock" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="rock">Rock</TabsTrigger>
                  <TabsTrigger value="explosive">Explosive</TabsTrigger>
                  <TabsTrigger value="drilling">Drilling</TabsTrigger>
                  <TabsTrigger value="other">Other Costs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="rock" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="rock-density">Rock Density (kg/m³)</Label>
                    <Input
                      id="rock-density"
                      type="number"
                      placeholder="e.g., 2600"
                      value={rockDensity}
                      onChange={(e) => setRockDensity(Number(e.target.value))}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="rock-volume">Rock Volume (m³)</Label>
                    <Input
                      id="rock-volume"
                      type="number"
                      placeholder="e.g., 1000"
                      value={rockVolume}
                      onChange={(e) => setRockVolume(Number(e.target.value))}
                      required
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="explosive" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="explosive-cost">Explosive Cost ($/kg)</Label>
                    <Input
                      id="explosive-cost"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 1.20"
                      value={explosiveCost}
                      onChange={(e) => setExplosiveCost(Number(e.target.value))}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="explosive-weight">Explosive Weight (kg)</Label>
                    <Input
                      id="explosive-weight"
                      type="number"
                      placeholder="e.g., 500"
                      value={explosiveWeight}
                      onChange={(e) => setExplosiveWeight(Number(e.target.value))}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="detonator-cost">Detonator Cost ($/unit)</Label>
                    <Input
                      id="detonator-cost"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 15"
                      value={detonatorCost}
                      onChange={(e) => setDetonatorCost(Number(e.target.value))}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="detonator-count">Number of Detonators</Label>
                    <Input
                      id="detonator-count"
                      type="number"
                      placeholder="e.g., 20"
                      value={detonatorCount}
                      onChange={(e) => setDetonatorCount(Number(e.target.value))}
                      required
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="drilling" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="drilling-cost">Drilling Cost ($/meter)</Label>
                    <Input
                      id="drilling-cost"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 10"
                      value={drillingCost}
                      onChange={(e) => setDrillingCost(Number(e.target.value))}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="drilling-meters">Total Drilling (meters)</Label>
                    <Input
                      id="drilling-meters"
                      type="number"
                      placeholder="e.g., 200"
                      value={drillingMeters}
                      onChange={(e) => setDrillingMeters(Number(e.target.value))}
                      required
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="other" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="labor-cost">Labor Cost ($)</Label>
                    <Input
                      id="labor-cost"
                      type="number"
                      step="1"
                      placeholder="e.g., 500"
                      value={laborCost}
                      onChange={(e) => setLaborCost(Number(e.target.value))}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="equipment-cost">Equipment Cost ($)</Label>
                    <Input
                      id="equipment-cost"
                      type="number"
                      step="1"
                      placeholder="e.g., 800"
                      value={equipmentCost}
                      onChange={(e) => setEquipmentCost(Number(e.target.value))}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="accessories-cost">Accessories & Miscellaneous Cost ($)</Label>
                    <Input
                      id="accessories-cost"
                      type="number"
                      step="1"
                      placeholder="e.g., 200"
                      value={accessoriesCost}
                      onChange={(e) => setAccessoriesCost(Number(e.target.value))}
                      required
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Calculating...' : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Blasting Cost
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Cost Calculation Results</span>
                <Button variant="outline" size="sm" onClick={exportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Rock Data</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Rock Volume:</span>
                    <span className="font-medium">{rockVolume} m³</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Rock Density:</span>
                    <span className="font-medium">{rockDensity} kg/m³</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Rock Tonnage:</span>
                    <span className="font-medium">{results.rockTonnage} tonnes</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Cost Breakdown</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Explosive Cost:</span>
                    <span className="font-medium">${results.explosiveTotal}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Drilling Cost:</span>
                    <span className="font-medium">${results.drillingTotal}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Detonator Cost:</span>
                    <span className="font-medium">${results.detonatorTotal}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Labor Cost:</span>
                    <span className="font-medium">${results.laborCost}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Equipment Cost:</span>
                    <span className="font-medium">${results.equipmentCost}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Accessories Cost:</span>
                    <span className="font-medium">${results.accessoriesCost}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="bg-muted p-4 rounded-md">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total Cost:</span>
                  <span className="text-lg font-bold">${results.totalCost}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-lg font-semibold">Cost per Tonne:</span>
                  <span className="text-lg font-bold">${results.costPerTonne}/tonne</span>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>
                  This calculation provides an estimate based on the parameters you entered. 
                  Actual costs may vary depending on site conditions, local pricing, and other factors.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}