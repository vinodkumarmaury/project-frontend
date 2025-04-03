'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BarChart2, Zap, Shield, Activity, ChevronRight, BookOpen, Bookmark, Users, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

  const benefits = [
    {
      title: "Cost Optimization",
      description: "Reduce operational costs by optimizing explosive usage and reducing overbreak.",
      icon: Award
    },
    {
      title: "Safety Improvements",
      description: "Predict vibration and noise levels to ensure compliance with safety standards.",
      icon: Shield
    },
    {
      title: "Enhanced Productivity",
      description: "Achieve better fragmentation sizes to improve excavation and crushing efficiency.",
      icon: Users
    },
    {
      title: "Environmental Compliance",
      description: "Maintain regulatory compliance by controlling impact on surrounding areas.",
      icon: Bookmark
    }
  ];

  return (
    <div className={`space-y-20 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section with Blasting Image */}
      <section className="relative h-[600px] overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10"></div>
        
        {/* Replace with your actual blasting image */}
        <Image 
          src="/images/blastImage.jpg" 
          alt="Rock blasting operation" 
          fill
          priority
          className="object-cover"
        />
        
        <div className="relative z-20 flex h-full flex-col justify-center px-6 sm:px-12 lg:px-24">
          <div className="max-w-[640px] space-y-6">
            <div className="inline-block rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground">
              Next-Gen Prediction Technology
            </div>
            <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl">
              Rock Blasting <span className="text-primary">Prediction</span> System
            </h1>
            <p className="text-lg text-gray-300 max-w-[500px]">
              Advanced machine learning algorithms to predict and optimize your rock blasting operations for improved safety, efficiency, and cost control.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/predictions">
                <Button size="lg" className="gap-2">
                  Start Prediction
                  <BarChart2 className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/documentation">
                <Button variant="outline" size="lg" className="gap-2 bg-white/10 backdrop-blur-sm text-white hover:text-primary hover:bg-stone-700">
                  Learn More
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground max-w-[700px] mx-auto">
            Our platform offers comprehensive tools designed specifically for mining and quarrying professionals.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-lg inline-block">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section with Dark Mode Support */}
      <section className="relative py-16 bg-muted/30 dark:bg-muted/10 rounded-xl">
        <div className="px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-[700px] mx-auto">
              Our advanced AI models analyze your rock blasting parameters to provide accurate predictions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-background/80 dark:bg-card border border-border/40 shadow-lg rounded-xl p-6 h-full">
                <div className="bg-primary/20 dark:bg-primary/30 rounded-full w-12 h-12 flex items-center justify-center text-primary font-bold mb-4">1</div>
                <h3 className="font-bold text-xl mb-3">Input Parameters</h3>
                <p className="text-muted-foreground">
                  Enter your rock properties, explosive characteristics, and blast design parameters.
                </p>
              </div>
              {/* Replace chevron with a line that works in dark mode */}
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                <div className="h-0.5 w-10 bg-gradient-to-r from-primary to-transparent"></div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative">
              <div className="bg-background/80 dark:bg-card border border-border/40 shadow-lg rounded-xl p-6 h-full">
                <div className="bg-primary/20 dark:bg-primary/30 rounded-full w-12 h-12 flex items-center justify-center text-primary font-bold mb-4">2</div>
                <h3 className="font-bold text-xl mb-3">AI Prediction</h3>
                <p className="text-muted-foreground">
                  Our machine learning algorithms analyze your data using multiple models for accurate results.
                </p>
              </div>
              {/* Replace chevron with a line that works in dark mode */}
              <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                <div className="h-0.5 w-10 bg-gradient-to-r from-primary to-transparent"></div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div>
              <div className="bg-background/80 dark:bg-card border border-border/40 shadow-lg rounded-xl p-6 h-full">
                <div className="bg-primary/20 dark:bg-primary/30 rounded-full w-12 h-12 flex items-center justify-center text-primary font-bold mb-4">3</div>
                <h3 className="font-bold text-xl mb-3">Optimization</h3>
                <p className="text-muted-foreground">
                  Get comprehensive results with recommended adjustments for optimal blasting outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Key Benefits</h2>
          <p className="text-muted-foreground max-w-[700px] mx-auto">
            Our prediction system provides tangible benefits for mining blasting operations.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border border-primary/10">
              <CardHeader className="pb-2">
                <benefit.icon className="h-6 w-6 text-primary mb-2" />
                <CardTitle>{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Showcase Section with Second Blasting Image */}
      <section className="grid md:grid-cols-2 gap-10 items-center px-6">
        <div>
          <h2 className="text-3xl font-bold mb-4">Industry-Leading Prediction Accuracy</h2>
          <p className="text-muted-foreground mb-6">
            Our system has been trained on real-world blasting scenarios across different mining conditions.
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center">
              <div className="bg-primary/20 rounded-full p-1 mr-3">
                <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Predict fragmentation size accuracy</span>
            </li>
            <li className="flex items-center">
              <div className="bg-primary/20 rounded-full p-1 mr-3">
                <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Forecast vibration levels to ensure regulatory compliance</span>
            </li>
            <li className="flex items-center">
              <div className="bg-primary/20 rounded-full p-1 mr-3">
                <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Forecast noise levels to minimize environmental impact</span>
            </li>
          </ul>
        </div>
        <div className="relative h-[400px] rounded-xl overflow-hidden">
          <Image 
            src="/images/blastImage.jpg" 
            alt="Blasting accuracy visualization" 
            fill
            className="object-cover"
          />
        </div>
      </section>
    </div>
  );
}