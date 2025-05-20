
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, ShieldCheck, Info, Settings, Wand2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

const ACCEPTED_FILE_TYPES = ".txt,.md,.doc,.docx,.xls,.xlsx,.ppt,.pptx,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

export default function SapArchitecturePage() {
  const [inputText, setInputText] = useState<string>("");
  const [anonymizedText, setAnonymizedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [customProjectPlaceholder, setCustomProjectPlaceholder] = useState<string>("");
  const [customClientPlaceholder, setCustomClientPlaceholder] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const { toast } = useToast();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setInputText(""); // Clear previous text
    setIsLoading(true);

    try {
      const fileType = file.type;
      const fileNameLower = file.name.toLowerCase();

      if (fileNameLower.endsWith(".txt") || fileNameLower.endsWith(".md") || fileType === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setInputText(e.target.result as string);
            toast({ title: "File loaded", description: `${file.name} content loaded.` });
          }
          setIsLoading(false);
        };
        reader.onerror = () => {
          toast({ title: "File Read Error", description: "Could not read the selected text file.", variant: "destructive" });
          setIsLoading(false);
        };
        reader.readAsText(file);
      } else if (fileNameLower.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputText(result.value);
        toast({ title: "DOCX file loaded", description: `Text extracted from ${file.name}.` });
        setIsLoading(false);
      } else if (fileNameLower.endsWith(".xlsx")) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        let fullText = "";
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetText = XLSX.utils.sheet_to_txt(worksheet, { txtEOL: "\n" });
          fullText += sheetText + "\n\n"; 
        });
        setInputText(fullText.trim());
        toast({ title: "XLSX file loaded", description: `Text extracted from ${file.name}.` });
        setIsLoading(false);
      } else if (fileNameLower.endsWith(".doc") || fileNameLower.endsWith(".xls") || fileNameLower.endsWith(".ppt") || fileNameLower.endsWith(".pptx")) {
        toast({
          title: "File Type Limitation",
          description: `Direct text extraction for ${file.name} (${fileType}) is complex or not fully supported in the browser. Please convert to .docx, .xlsx, .txt or copy-paste the content.`,
          variant: "default",
          duration: 7000,
        });
        setInputText(`File "${file.name}" was uploaded, but direct text extraction for this format is limited. Please copy content manually or convert to a supported format like .docx or .xlsx.`);
        setIsLoading(false);
      } else {
        toast({
          title: "Unsupported File Type",
          description: `File type for ${file.name} is not supported for direct text extraction. Try .txt, .md, .docx, or .xlsx.`,
          variant: "destructive",
        });
        setFileName(null);
        setIsLoading(false);
        (event.target as HTMLInputElement).value = ""; 
        return;
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "File Processing Error",
        description: `Could not process ${file.name}. Ensure it's a valid file format.`,
        variant: "destructive",
      });
      setFileName(null);
      setIsLoading(false);
    }
  };

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handleAnonymize = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setAnonymizedText("");

    if (!inputText.trim()) {
      toast({
        title: "No input provided",
        description: "Please upload a document or paste text to anonymize.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/sap-anonymize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: inputText,
          customProjectPlaceholder: customProjectPlaceholder.trim() || undefined,
          customClientPlaceholder: customClientPlaceholder.trim() || undefined,
          theme: theme.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Anonymization API request failed or returned non-JSON response." }));
        toast({
          title: "Anonymization Error",
          description: errorData.error || "Anonymization API request failed.",
          variant: "destructive",
        });
        setIsLoading(false); // Stop loading indicator
        return; // Exit function
      }

      const data = await response.json();
      setAnonymizedText(data.anonymizedText);
      toast({
        title: "Success",
        description: "Text has been anonymized/thematized.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during anonymization.",
        variant: "destructive",
      });
      console.error("Anonymization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" /> SAP Architecture Support Tools
          </h1>
          <p className="text-muted-foreground">Document Anonymization supporting .txt, .md, .docx, .xlsx, and manual text input.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document & Text Anonymization / Thematization</CardTitle>
            <CardDescription>
              Upload a document or paste text. Sensitive information like project names, client names, and PII will be replaced.
              Optionally, set custom placeholders or a theme. Custom placeholders for project/client names take precedence. 
              If a theme is set, it will be used for other PII, and for project/client names if custom placeholders are not provided.
              For .doc, .xls, .ppt, .pptx, conversion or copy-pasting is recommended.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnonymize} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors text-center">
                  <Label htmlFor="document-upload" className="cursor-pointer">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">
                      {fileName ? `Selected: ${fileName}` : `Upload Document (${ACCEPTED_FILE_TYPES.split(',').filter(t => t.startsWith('.')).slice(0,4).join(', ')}, etc.)`}
                    </span>
                    <input
                      id="document-upload"
                      type="file"
                      accept={ACCEPTED_FILE_TYPES}
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </Label>
                   {fileName && (
                     <Button variant="link" size="sm" className="mt-2 text-xs" onClick={() => {setInputText(''); setFileName(null); (document.getElementById('document-upload') as HTMLInputElement).value = ''; setIsLoading(false)}}>Clear loaded file</Button>
                   )}
                </div>
                
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-4 text-muted-foreground text-sm">OR</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <div>
                  <Label htmlFor="text-paste" className="block text-sm font-medium mb-2">
                    Paste Text (or text from unsupported files)
                  </Label>
                  <Textarea
                    id="text-paste"
                    rows={10}
                    value={inputText}
                    onChange={handleTextChange}
                    placeholder="Paste your SAP architecture notes or document content here..."
                    className="w-full shadow-sm"
                    disabled={isLoading && fileName !== null} 
                  />
                </div>

                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                       <Settings className="h-5 w-5 text-muted-foreground"/> Optional Anonymization Settings
                    </CardTitle>
                     <CardDescription className="text-xs">
                       Specify custom text to replace project/client names, or provide a theme for creative replacements.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-2">
                    <div>
                      <Label htmlFor="custom-project-placeholder" className="text-sm font-medium">
                        Custom Project Placeholder
                      </Label>
                      <Input
                        id="custom-project-placeholder"
                        type="text"
                        value={customProjectPlaceholder}
                        onChange={(e) => setCustomProjectPlaceholder(e.target.value)}
                        placeholder="e.g., [PROJECT_ALPHA] (Overrides theme for projects)"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-client-placeholder" className="text-sm font-medium">
                        Custom Client Placeholder
                      </Label>
                      <Input
                        id="custom-client-placeholder"
                        type="text"
                        value={customClientPlaceholder}
                        onChange={(e) => setCustomClientPlaceholder(e.target.value)}
                        placeholder="e.g., [CLIENT_ACME] (Overrides theme for clients)"
                        className="mt-1"
                      />
                    </div>
                     <div>
                      <Label htmlFor="theme" className="text-sm font-medium flex items-center gap-1">
                        <Wand2 className="h-4 w-4"/> Theme (Optional)
                      </Label>
                      <Input
                        id="theme"
                        type="text"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        placeholder="e.g., Star Wars, Cyberpunk, Medieval Fantasy"
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full mt-4" disabled={isLoading || !inputText.trim()}>
                  {isLoading && fileName === null ? "Anonymizing..." : isLoading && fileName !== null ? "Processing File..." : "Anonymize / Thematize Text"}
                </Button>
              </div>

              <div className="space-y-4">
                <Label htmlFor="anonymized-output" className="block text-sm font-medium">
                  Anonymized / Thematized Output
                </Label>
                <Textarea
                  id="anonymized-output"
                  rows={inputText ? Math.max(10, inputText.split('\n').length + 2) : 10}
                  value={anonymizedText}
                  readOnly
                  placeholder="Anonymized/thematized text will appear here."
                  className="w-full bg-muted/30 shadow-sm"
                />
                 <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Review Carefully</AlertTitle>
                  <AlertDescription>
                    Always review the output thoroughly to ensure all sensitive data has been correctly processed and the thematization is appropriate before sharing. AI-based processing may not be perfect.
                  </AlertDescription>
                </Alert>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
