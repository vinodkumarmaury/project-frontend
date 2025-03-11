import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, Zap, Shield, Activity } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: BarChart2,
      title: 'Advanced Predictions',
      description: 'Get accurate predictions for fragmentation size, vibration levels, and noise levels.',
    },
    {
      icon: Zap,
      title: 'Real-time Analysis',
      description: 'Instant results using multiple machine learning models for better accuracy.',
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security measures.',
    },
    {
      icon: Activity,
      title: 'Performance Metrics',
      description: 'Track and analyze your blasting performance over time.',
    },
  ];

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Rock Blasting Prediction System
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground">
          Advanced machine learning algorithms to predict and optimize your rock blasting operations.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/predictions">
            <Button size="lg">
              Start Prediction
              <BarChart2 className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="h-10 w-10 text-primary" />
              <CardTitle className="mt-4">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}