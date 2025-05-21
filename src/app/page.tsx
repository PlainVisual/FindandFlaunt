// @/app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { SearchSection } from "@/components/SearchSection";
import { ResultsSection } from "@/components/ResultsSection";
import { AdviceSection } from "@/components/AdviceSection";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { performSearch, getStylingAdvice } from './actions';
import type { AnalyzeSearchResults_FlowInput, AnalyzeSearchResultsOutput } from '@/ai/flows/analyze-search-results';
import type { RelevantProduct } from '@/lib/schemas';
import type { ProvideStylingAdviceInput, ProvideStylingAdviceOutput } from '@/ai/flows/provide-styling-advice';
import type { SearchFormValues } from '@/lib/schemas';
import { useToast } from "@/hooks/use-toast";


type AppStep = 'input' | 'results' | 'advice';

export default function FindAndFlauntPage() {
  const [step, setStep] = useState<AppStep>('input');
  const [analyzedProducts, setAnalyzedProducts] = useState<AnalyzeSearchResultsOutput>([]);
  const [selectedProduct, setSelectedProduct] = useState<RelevantProduct | null>(null);
  
  const [currentClothingItem, setCurrentClothingItem] = useState<string>("");
  const [currentColorPreference, setCurrentColorPreference] = useState<string>("");

  const [stylingAdvice, setStylingAdvice] = useState<ProvideStylingAdviceOutput | null>(null);
  
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [selectedProductIdForLoading, setSelectedProductIdForLoading] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    const handlePopState = () => {
      // Handle browser back/forward navigation if needed
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSearchSubmit = async (values: SearchFormValues) => {
    setIsLoadingSearch(true);
    setAnalyzedProducts([]); 

    setCurrentClothingItem(values.clothingItem); 
    setCurrentColorPreference(values.colorPreference || ""); 

    const searchInput: AnalyzeSearchResults_FlowInput = { 
      clothingItem: values.clothingItem,
      colorPreference: values.colorPreference || "",
    };
    const result = await performSearch(searchInput);
    setIsLoadingSearch(false);

    if ('error' in result) {
      toast({ title: "Zoekfout", description: result.error, variant: "destructive" });
    } else {
      setAnalyzedProducts(result);
      setStep('results');
      if (result.length === 0) {
        toast({ title: "Geen Producten Gevonden", description: "Geen items kwamen overeen met je zoekopdracht op Shoeby.nl of de AI kon ze niet identificeren.", variant: "default" });
      }
    }
  };

  const handleGetAdvice = async (product: RelevantProduct) => {
    setSelectedProduct(product);
    setSelectedProductIdForLoading(product.productUrl || null);
    setIsLoadingAdvice(true);
    setStylingAdvice(null);

    if (!product.imageUrl || !product.description) {
        toast({ title: "Missende Productinformatie", description: "Kan geen advies krijgen voor producten met ontbrekende afbeelding of beschrijving.", variant: "destructive" });
        setIsLoadingAdvice(false);
        setSelectedProductIdForLoading(null);
        return;
    }
    
    if (!product.imageUrl.startsWith('http://') && !product.imageUrl.startsWith('https://') && !product.imageUrl.startsWith('data:')) {
        toast({ title: "Ongeldige Productafbeelding", description: "De URL van de productafbeelding is niet geldig.", variant: "destructive" });
        setIsLoadingAdvice(false);
        setSelectedProductIdForLoading(null);
        return;
    }

    const adviceInput: ProvideStylingAdviceInput = {
      clothingItem: currentClothingItem || product.title || "kledingstuk", 
      colorPreference: currentColorPreference || "elke kleur", 
      itemDescription: product.description,
      itemImageUrl: product.imageUrl,
    };

    const result = await getStylingAdvice(adviceInput);
    setIsLoadingAdvice(false);
    setSelectedProductIdForLoading(null);

    if ('error' in result) {
      toast({ title: "Stijladvies Fout", description: result.error, variant: "destructive" });
    } else {
      setStylingAdvice(result);
      setStep('advice');
    }
  };

  const resetToInput = () => {
    setStep('input');
    setAnalyzedProducts([]);
    setSelectedProduct(null);
    setStylingAdvice(null);
    setCurrentClothingItem("");
    setCurrentColorPreference("");
  };
  
  const resetToResults = () => {
    setStep('results');
    setSelectedProduct(null);
    setStylingAdvice(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex flex-1 flex-col md:justify-center container mx-auto p-4 md:p-8">
        {isLoadingSearch && <LoadingSpinner message="Shoeby.nl aan het doorzoeken en resultaten aan het analyseren..." className="my-10" />}
        
        {!isLoadingSearch && (
          <>
            {step === 'input' && (
              <SearchSection onSubmit={handleSearchSubmit} isLoading={isLoadingSearch} />
            )}
            {step === 'results' && (
              <ResultsSection 
                products={analyzedProducts} 
                onSelectProduct={handleGetAdvice} 
                onReset={resetToInput}
                isLoadingAdvice={isLoadingAdvice}
                selectedProductId={selectedProductIdForLoading}
              />
            )}
            {step === 'advice' && selectedProduct && stylingAdvice && (
              <AdviceSection 
                product={selectedProduct} 
                advice={stylingAdvice} 
                onResetToInput={resetToInput}
                onResetToResults={resetToResults}
              />
            )}
          </>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
