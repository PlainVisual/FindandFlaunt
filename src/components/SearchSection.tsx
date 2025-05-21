// @/components/SearchSection.tsx
"use client";

import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SearchFormSchema, type SearchFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Palette, Search, Shirt } from "lucide-react";
import Image from "next/image";

interface SearchSectionProps {
  onSubmit: (values: SearchFormValues) => Promise<void>;
  isLoading: boolean;
}

export function SearchSection({ onSubmit, isLoading }: SearchSectionProps) {
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(SearchFormSchema),
    defaultValues: {
      clothingItem: "",
      colorPreference: "",
    },
  });

  const handleSubmit: SubmitHandler<SearchFormValues> = async (data) => {
    await onSubmit(data);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-1/3 relative min-h-[200px] md:min-h-0">
        <Image
          src="https://placehold.co/400x600.png"
          alt="Fashion inspiration"
          fill
          style={{ objectFit: "cover" }}
          className="md:rounded-l-lg md:rounded-r-none rounded-t-lg"
          data-ai-hint="fashion model"
        />
      </div>
      <div className="w-full md:w-2/3 flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 font-display">
            <Search className="h-6 w-6 text-primary" />
            Vind Jouw Stijl
          </CardTitle>
          <CardDescription>
            Voer je kledingvoorkeuren in. Wij doorzoeken Shoeby.nl voor jou.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-grow">
            <CardContent className="space-y-6 flex-grow">
              <FormField
                control={form.control}
                name="clothingItem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Shirt className="h-4 w-4" />Kledingstuk</FormLabel>
                    <FormControl>
                      <Input placeholder="bijv. blouse, jurk, jeans" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="colorPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Palette className="h-4 w-4" />Kleurvoorkeur</FormLabel>
                    <FormControl>
                      <Input placeholder="bijv. blauw, rood, zwart (optioneel)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Voer een kleur in of laat leeg indien geen voorkeur.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Shoeby.nl aan het doorzoeken...
                  </>
                ) : (
                  "Items Vinden op Shoeby.nl"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </div>
    </Card>
  );
}
