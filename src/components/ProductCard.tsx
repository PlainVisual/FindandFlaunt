// @/components/ProductCard.tsx
"use client";

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from 'lucide-react';
import type { RelevantProduct } from '@/lib/schemas'; // Updated import path


interface ProductCardProps {
  product: RelevantProduct;
  onGetAdvice: (product: RelevantProduct) => void;
  isLoadingAdvice: boolean;
  selectedProductId?: string | null;
}

export function ProductCard({ product, onGetAdvice, isLoadingAdvice, selectedProductId }: ProductCardProps) {
  const placeholderImage = "https://placehold.co/300x400.png";
  const isThisCardLoading = isLoadingAdvice && selectedProductId === product.productUrl;

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <CardHeader className="p-4">
        <div className="aspect-[3/4] relative w-full overflow-hidden rounded-md bg-muted">
          <Image
            src={product.imageUrl || placeholderImage}
            alt={product.title || "Product image"}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="fashion clothing"
            onError={(e) => (e.currentTarget.src = placeholderImage)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1 line-clamp-2 leading-tight h-[2.5em]">
          {product.title || "Unnamed Product"}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-2 line-clamp-3 leading-snug h-[3.9em]">
          {product.description || "No description available."}
        </CardDescription>
        <div className="flex items-center justify-between mb-3">
          <p className="text-lg font-bold text-primary">{product.price || "N/A"}</p>
          {typeof product.relevanceScore === 'number' && (
            <Badge variant={product.relevanceScore > 0.7 ? "default" : "secondary"} className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {product.relevanceScore.toFixed(2)} Rel.
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button 
          onClick={() => onGetAdvice(product)} 
          className="w-full"
          disabled={isThisCardLoading || !product.productUrl}
        >
          {isThisCardLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Getting Advice...
            </>
          ) : (
            "Get Style Advice"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
