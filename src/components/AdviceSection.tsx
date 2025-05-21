// @/components/AdviceSection.tsx
"use client";

import { StyleAdviceDisplay } from "./StyleAdviceDisplay";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { RelevantProductSchema } from '@/ai/flows/analyze-search-results';
import type { ProvideStylingAdviceOutput } from '@/ai/flows/provide-styling-advice';
import type { z } from 'zod';

type Product = z.infer<typeof RelevantProductSchema>;

interface AdviceSectionProps {
  product: Product;
  advice: ProvideStylingAdviceOutput;
  onResetToInput: () => void;
  onResetToResults: () => void;
}

export function AdviceSection({ product, advice, onResetToInput, onResetToResults }: AdviceSectionProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold">Your Style Advice</h2>
        <div className="flex gap-2">
          <Button onClick={onResetToResults} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>
          <Button onClick={onResetToInput} variant="ghost">
            New Search
          </Button>
        </div>
      </div>
      <StyleAdviceDisplay originalProduct={product} advice={advice} />
    </div>
  );
}
