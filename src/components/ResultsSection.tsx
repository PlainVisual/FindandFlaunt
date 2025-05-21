// @/components/ResultsSection.tsx
"use client";

import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { AnalyzeSearchResultsOutput } from '@/ai/flows/analyze-search-results';
import type { RelevantProduct } from '@/lib/schemas'; // Updated import path


interface ResultsSectionProps {
  products: AnalyzeSearchResultsOutput;
  onSelectProduct: (product: RelevantProduct) => void;
  onReset: () => void;
  isLoadingAdvice: boolean;
  selectedProductId?: string | null;
}

export function ResultsSection({ products, onSelectProduct, onReset, isLoadingAdvice, selectedProductId }: ResultsSectionProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground mb-4">No products found matching your criteria.</p>
        <Button onClick={onReset} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Try a New Search
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-display font-semibold">Search Results ({products.length})</h2>
        <Button onClick={onReset} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          New Search
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard 
            key={product.productUrl || `product-${index}`} 
            product={product as RelevantProduct} 
            onGetAdvice={onSelectProduct}
            isLoadingAdvice={isLoadingAdvice}
            selectedProductId={selectedProductId}
          />
        ))}
      </div>
    </div>
  );
}
