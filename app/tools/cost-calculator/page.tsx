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

  // Rock parameters
  const [rockDensity, setRockDensity] = useState<number>(2600);
  const [rockVolume, setRockVolume] = useState<number>(1000);
  
  // Drilling parameters
  const [holeCount, setHoleCount] = useState<number>(40);
  const [holeDiameter, setHoleDiameter] = useState<number>(115);
  const [holeDepth, setHoleDepth] = useState<number>(10);
  const [drillingCost, setDrillingCost] = useState<number>(10);
  const [drillingMeters, setDrillingMeters] = useState<number>(200);
  const [drillBitCost, setDrillBitCost] = useState<number>(500);
  const [maintenanceCostPerMeter, setMaintenanceCostPerMeter] = useState<number>(0.5);
  
  // Explosive parameters
  const [explosiveCost, setExplosiveCost] = useState<number>(1.2);
  const [explosiveWeight, setExplosiveWeight] = useState<number>(500);
  const [detonatorCost, setDetonatorCost] = useState<number>(15);
  const [detonatorCount, setDetonatorCount] = useState<number>(20);
  const [primerCost, setPrimerCost] = useState<number>(8);
  const [primerCount, setPrimerCount] = useState<number>(40);
  const [shockTubeCost, setShockTubeCost] = useState<number>(0.8);
  const [shockTubeLength, setShockTubeLength] = useState<number>(200);
  
  // Accessories and environmental costs
  const [stemmingCost, setStemmingCost] = useState<number>(5);
  const [stemmingVolume, setStemmingVolume] = useState<number>(20);
  const [blastingMatCost, setBlastingMatCost] = useState<number>(2000);
  const [blastingMatCount, setBlastingMatCount] = useState<number>(0);
  const [vibrationMonitoringCost, setVibrationMonitoringCost] = useState<number>(500);
  const [dustSuppressionCost, setDustSuppressionCost] = useState<number>(300);
  const [permitCost, setPermitCost] = useState<number>(200);
  
  // Operational costs
  const [laborCost, setLaborCost] = useState<number>(500);
  const [equipmentCost, setEquipmentCost] = useState<number>(800);
  const [accessoriesCost, setAccessoriesCost] = useState<number>(200);
  const [secondaryBlastingCost, setSecondaryBlastingCost] = useState<number>(0);
  const [excavationHaulageCost, setExcavationHaulageCost] = useState<number>(5);

  const calculateCost = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate total drilling meters from number of holes and depth if not directly entered
      const calculatedDrillingMeters = holeCount * holeDepth;
      const totalDrillingMeters = drillingMeters || calculatedDrillingMeters;
      
      // Calculate tons of rock
      const rockTonnage = (rockDensity * rockVolume) / 1000; // Convert kg to tonnes
      
      // Calculate component costs
      const explosiveTotal = explosiveCost * explosiveWeight;
      const drillingTotal = drillingCost * totalDrillingMeters;
      const drillBitMaintenanceTotal = drillBitCost + (maintenanceCostPerMeter * totalDrillingMeters);
      const detonatorTotal = detonatorCost * detonatorCount;
      const primerTotal = primerCost * primerCount;
      const shockTubeTotal = shockTubeCost * shockTubeLength;
      const stemmingTotal = stemmingCost * stemmingVolume;
      const blastingMatTotal = blastingMatCost * blastingMatCount;
      const environmentalTotal = vibrationMonitoringCost + dustSuppressionCost + permitCost;
      const excavationTotal = excavationHaulageCost * rockTonnage;
      
      // Initiation system total
      const initiationSystemTotal = detonatorTotal + primerTotal + shockTubeTotal;
      
      // Calculate total cost and cost per tonne
      const totalCost = 
        explosiveTotal + 
        drillingTotal + 
        drillBitMaintenanceTotal + 
        initiationSystemTotal + 
        stemmingTotal +
        blastingMatTotal +
        environmentalTotal +
        laborCost + 
        equipmentCost + 
        accessoriesCost +
        secondaryBlastingCost +
        excavationTotal;
        
      const costPerTonne = totalCost / rockTonnage;
      
      // Calculate powder factor (kg explosive per tonne of rock)
      const powderFactor = explosiveWeight / rockTonnage;
      
      // Prepare results
      const resultsData = {
        // Rock data
        rockTonnage: rockTonnage.toFixed(2),
        
        // Drilling costs
        drillingTotal: drillingTotal.toFixed(2),
        drillBitMaintenanceTotal: drillBitMaintenanceTotal.toFixed(2),
        
        // Explosive costs
        explosiveTotal: explosiveTotal.toFixed(2),
        
        // Initiation system costs
        detonatorTotal: detonatorTotal.toFixed(2),
        primerTotal: primerTotal.toFixed(2),
        shockTubeTotal: shockTubeTotal.toFixed(2),
        initiationSystemTotal: initiationSystemTotal.toFixed(2),
        
        // Accessories and environmental costs
        stemmingTotal: stemmingTotal.toFixed(2),
        blastingMatTotal: blastingMatTotal.toFixed(2),
        environmentalTotal: environmentalTotal.toFixed(2),
        
        // Operational costs
        laborCost: laborCost.toFixed(2),
        equipmentCost: equipmentCost.toFixed(2),
        accessoriesCost: accessoriesCost.toFixed(2),
        secondaryBlastingCost: secondaryBlastingCost.toFixed(2),
        excavationTotal: excavationTotal.toFixed(2),
        
        // Summary
        totalCost: totalCost.toFixed(2),
        costPerTonne: costPerTonne.toFixed(2),
        powderFactor: powderFactor.toFixed(3),
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
      // Create CSV content with all the detailed parameters
      const csvContent = `
Parameter,Value
Rock Tonnage (tonnes),${results.rockTonnage}

# Drilling Costs
Drilling Cost ($),${results.drillingTotal}
Drill Bit & Maintenance ($),${results.drillBitMaintenanceTotal}

# Explosive Costs
Explosive Cost ($),${results.explosiveTotal}

# Initiation System Costs
Detonator Cost ($),${results.detonatorTotal}
Primer Cost ($),${results.primerTotal}
Shock Tube Cost ($),${results.shockTubeTotal}
Total Initiation System ($),${results.initiationSystemTotal}

# Accessories & Environmental Costs
Stemming Cost ($),${results.stemmingTotal}
Blasting Mat Cost ($),${results.blastingMatTotal}
Environmental Monitoring & Safety ($),${results.environmentalTotal}

# Operational Costs
Labor Cost ($),${results.laborCost}
Equipment Cost ($),${results.equipmentCost}
Accessories Cost ($),${results.accessoriesCost}
Secondary Blasting Cost ($),${results.secondaryBlastingCost}
Excavation & Haulage Cost ($),${results.excavationTotal}

# Summary
Total Cost ($),${results.totalCost}
Cost per Tonne ($/tonne),${results.costPerTonne}
Powder Factor (kg/tonne),${results.powderFactor}
`.trim();
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'detailed-blasting-cost-calculation.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export Successful',
        description: 'Detailed blasting cost data exported as CSV',
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
        <h1 className="text-3xl font-bold">Comprehensive Blasting Cost Calculator</h1>
        <p className="text-muted-foreground">
          Calculate detailed costs for your blasting operation including all critical parameters
        </p>
      </div>

      <div className="grid gap-6 mt-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calculation Parameters</CardTitle>
            <CardDescription>
              Enter all parameters of your blasting operation for accurate costing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={calculateCost} className="space-y-6">
              <Tabs defaultValue="rock" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="rock">Rock</TabsTrigger>
                  <TabsTrigger value="drilling">Drilling</TabsTrigger>
                  <TabsTrigger value="explosive">Explosives</TabsTrigger>
                  <TabsTrigger value="environment">Environmental</TabsTrigger>
                  <TabsTrigger value="operation">Operational</TabsTrigger>
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
                
                <TabsContent value="drilling" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="hole-count">Number of Holes</Label>
                      <Input
                        id="hole-count"
                        type="number"
                        placeholder="e.g., 40"
                        value={holeCount}
                        onChange={(e) => setHoleCount(Number(e.target.value))}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="hole-diameter">Hole Diameter (mm)</Label>
                      <Input
                        id="hole-diameter"
                        type="number"
                        placeholder="e.g., 115"
                        value={holeDiameter}
                        onChange={(e) => setHoleDiameter(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="hole-depth">Hole Depth (m)</Label>
                      <Input
                        id="hole-depth"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 10"
                        value={holeDepth}
                        onChange={(e) => setHoleDepth(Number(e.target.value))}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="drilling-cost">Drilling Cost ($/m)</Label>
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="drill-bit-cost">Drill Bit Cost ($)</Label>
                      <Input
                        id="drill-bit-cost"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 500"
                        value={drillBitCost}
                        onChange={(e) => setDrillBitCost(Number(e.target.value))}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="maintenance-cost">Maintenance Cost ($/m)</Label>
                      <Input
                        id="maintenance-cost"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 0.5"
                        value={maintenanceCostPerMeter}
                        onChange={(e) => setMaintenanceCostPerMeter(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="explosive" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="primer-cost">Primer Cost ($/unit)</Label>
                      <Input
                        id="primer-cost"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 8"
                        value={primerCost}
                        onChange={(e) => setPrimerCost(Number(e.target.value))}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="primer-count">Number of Primers</Label>
                      <Input
                        id="primer-count"
                        type="number"
                        placeholder="e.g., 40"
                        value={primerCount}
                        onChange={(e) => setPrimerCount(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="shock-tube-cost">Shock Tube Cost ($/m)</Label>
                      <Input
                        id="shock-tube-cost"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 0.8"
                        value={shockTubeCost}
                        onChange={(e) => setShockTubeCost(Number(e.target.value))}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="shock-tube-length">Shock Tube Length (m)</Label>
                      <Input
                        id="shock-tube-length"
                        type="number"
                        placeholder="e.g., 200"
                        value={shockTubeLength}
                        onChange={(e) => setShockTubeLength(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="environment" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="stemming-cost">Stemming Cost ($/m³)</Label>
                      <Input
                        id="stemming-cost"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 5"
                        value={stemmingCost}
                        onChange={(e) => setStemmingCost(Number(e.target.value))}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="stemming-volume">Stemming Volume (m³)</Label>
                      <Input
                        id="stemming-volume"
                        type="number"
                        placeholder="e.g., 20"
                        value={stemmingVolume}
                        onChange={(e) => setStemmingVolume(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="blasting-mat-cost">Blasting Mat Cost ($/unit)</Label>
                      <Input
                        id="blasting-mat-cost"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 2000"
                        value={blastingMatCost}
                        onChange={(e) => setBlastingMatCost(Number(e.target.value))}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="blasting-mat-count">Number of Blasting Mats</Label>
                      <Input
                        id="blasting-mat-count"
                        type="number"
                        placeholder="e.g., 0"
                        value={blastingMatCount}
                        onChange={(e) => setBlastingMatCount(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="vibration-monitoring-cost">Vibration Monitoring Cost ($)</Label>
                      <Input
                        id="vibration-monitoring-cost"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 500"
                        value={vibrationMonitoringCost}
                        onChange={(e) => setVibrationMonitoringCost(Number(e.target.value))}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="dust-suppression-cost">Dust Suppression Cost ($)</Label>
                      <Input
                        id="dust-suppression-cost"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 300"
                        value={dustSuppressionCost}
                        onChange={(e) => setDustSuppressionCost(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="permit-cost">Permit Cost ($)</Label>
                    <Input
                      id="permit-cost"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 200"
                      value={permitCost}
                      onChange={(e) => setPermitCost(Number(e.target.value))}
                      required
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="operation" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
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
                    
                    <div className="grid gap-2">
                      <Label htmlFor="secondary-blasting-cost">Secondary Blasting Cost ($)</Label>
                      <Input
                        id="secondary-blasting-cost"
                        type="number"
                        step="1"
                        placeholder="e.g., 0"
                        value={secondaryBlastingCost}
                        onChange={(e) => setSecondaryBlastingCost(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="excavation-haulage-cost">Excavation & Haulage Cost ($/tonne)</Label>
                    <Input
                      id="excavation-haulage-cost"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 5"
                      value={excavationHaulageCost}
                      onChange={(e) => setExcavationHaulageCost(Number(e.target.value))}
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
                    <span className="text-muted-foreground">Drilling Cost:</span>
                    <span className="font-medium">${results.drillingTotal}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Drill Bit & Maintenance:</span>
                    <span className="font-medium">${results.drillBitMaintenanceTotal}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Explosive Cost:</span>
                    <span className="font-medium">${results.explosiveTotal}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Detonator Cost:</span>
                    <span className="font-medium">${results.detonatorTotal}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Primer Cost:</span>
                    <span className="font-medium">${results.primerTotal}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Shock Tube Cost:</span>
                    <span className="font-medium">${results.shockTubeTotal}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Total Initiation System:</span>
                    <span className="font-medium">${results.initiationSystemTotal}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Stemming Cost:</span>
                    <span className="font-medium">${results.stemmingTotal}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Blasting Mat Cost:</span>
                    <span className="font-medium">${results.blastingMatTotal}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Environmental Monitoring & Safety:</span>
                    <span className="font-medium">${results.environmentalTotal}</span>
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
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Secondary Blasting Cost:</span>
                    <span className="font-medium">${results.secondaryBlastingCost}</span>
                  </div>
                  <div className="flex justify-between border-b py-1">
                    <span className="text-muted-foreground">Excavation & Haulage Cost:</span>
                    <span className="font-medium">${results.excavationTotal}</span>
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
                <div className="flex justify-between mt-2">
                  <span className="text-lg font-semibold">Powder Factor:</span>
                  <span className="text-lg font-bold">{results.powderFactor} kg/tonne</span>
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