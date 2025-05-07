"use client";
import Link from "next/link";
import { useState } from "react";

export default function MainPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <main className="container mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Main Application</h1>
          <Link 
            href="/"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Back to Home
          </Link>
        </div>
        
        <div className="grid gap-6">
          <section className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Main Application</h2>
            <p className="text-muted-foreground">
              This is the main application page where you can start building your features.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
} 