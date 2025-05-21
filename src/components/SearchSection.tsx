// @/components/SearchSection.tsx
"use client";

import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SearchFormSchema, type SearchFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Palette, Search, Shirt, FileText } from "lucide-react";

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
      searchResultsHtml: "",
    },
  });

  const handleSubmit: SubmitHandler<SearchFormValues> = async (data) => {
    await onSubmit(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          Find Your Style
        </CardTitle>
        <CardDescription>
          Enter your clothing preferences and paste the HTML content from Shoeby.nl search results.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="clothingItem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><Shirt className="h-4 w-4" />Clothing Item</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., blouse, dress, jeans" {...field} />
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
                  <FormLabel className="flex items-center gap-2"><Palette className="h-4 w-4" />Color Preference</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., blue, red, black" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="searchResultsHtml"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4" />Shoeby.nl Search Results HTML</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the HTML content of the search results page here..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Go to Shoeby.nl, search for items, then right-click on the page, select "View Page Source", and copy-paste the entire content here.
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
                  Analyzing Results...
                </>
              ) : (
                "Analyze Search Results"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
