"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AnonymizePage() {
  const [inputText, setInputText] = useState<string>(""); // State to hold the input text from textarea or file
  const [anonymizedText, setAnonymizedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setInputText(e.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handleAnonymize = async (event: FormEvent) => {
    // Prevent default form submission
    event.preventDefault();
    setIsLoading(true);
    setAnonymizedText("");

    if (!inputText.trim()) {
      toast({
        title: "No input provided",
        description: "Please upload a file or paste text to anonymize.",
        variant: "destructive",
      });
      // Stop loading and return if no input is provided
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/anonymize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      // Check if the response is not OK (e.g., 400, 500 errors)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Anonymization failed");
      }

      const data = await response.json();
      // Update the state with the anonymized text
      setAnonymizedText(data.anonymizedText);
      toast({
        title: "Success",
        description: "Text anonymized successfully.",
      });
    } catch (error: any) {
      toast({
        // Display an error toast if something goes wrong
        title: "Error",
        description: error.message || "An error occurred during anonymization.",
        variant: "destructive",
      });
      console.error("Anonymization error:", error);
    } finally {
      setIsLoading(false);
      // Ensure loading state is false regardless of success or failure
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Anonymize Text</h1>

        <form onSubmit={handleAnonymize} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Text or Upload Document</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* File upload input */}
              <div>
                <Label htmlFor="document-upload" className="block text-sm font-medium mb-2">
                  Upload Document (.txt)
                </Label>
                <input
                  id="document-upload"
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {/* Separator */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">OR</span>
              </div>
              {/* Textarea for pasting text */}
              <div>
                <Label htmlFor="text-paste" className="block text-sm font-medium mb-2">
                  Paste Text
                </Label>
                <Textarea
                  id="text-paste"
                  rows={10}
                  value={inputText}
                  onChange={handleTextChange}
                  placeholder="Paste the text you want to anonymize here..."
                  className="w-full"
                />
              </div>
              {/* Anonymize button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Anonymizing..." : "Anonymize"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anonymized Text</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Display anonymized text or a placeholder */}
              {anonymizedText ? (
                <Textarea
                  rows={10}
                  value={anonymizedText}
                  readOnly
                  className="w-full bg-gray-100"
                />
              ) : (
                <p className="text-gray-500">Anonymized text will appear here.</p>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}