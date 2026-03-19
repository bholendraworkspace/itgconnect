"use client";

import { useState, useEffect, useCallback } from "react";
import { useFirestore, useUser } from "@/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import type { ApiProject, ApiEndpoint, ApiFolder } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Trash2,
  Search,
  Sparkles,
  Loader2,
  Globe,
  Copy,
  Check,
  Plus,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Method colors ──────────────────────────────────────────────────────────
const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-500",
  POST: "bg-blue-500",
  PUT: "bg-amber-500",
  PATCH: "bg-orange-500",
  DELETE: "bg-red-500",
  HEAD: "bg-purple-500",
  OPTIONS: "bg-slate-500",
};

const METHOD_TEXT_COLORS: Record<string, string> = {
  GET: "text-emerald-600 dark:text-emerald-400",
  POST: "text-blue-600 dark:text-blue-400",
  PUT: "text-amber-600 dark:text-amber-400",
  PATCH: "text-orange-600 dark:text-orange-400",
  DELETE: "text-red-600 dark:text-red-400",
  HEAD: "text-purple-600 dark:text-purple-400",
  OPTIONS: "text-slate-600 dark:text-slate-400",
};

// ─── Postman collection parser ──────────────────────────────────────────────
function parsePostmanCollection(json: any): Omit<ApiProject, "id" | "importedAt" | "importedBy" | "importedByName"> {
  const info = json.info || {};
  const name = info.name || json.name || "Imported Collection";
  const description = info.description || "";
  const baseUrl = "";

  function parseEndpoint(item: any): ApiEndpoint | null {
    const req = item.request;
    if (!req) return null;

    const method = (typeof req === "string" ? "GET" : (req.method || "GET")).toUpperCase() as ApiEndpoint["method"];
    let url = "";
    if (typeof req.url === "string") {
      url = req.url;
    } else if (req.url?.raw) {
      url = req.url.raw;
    } else if (req.url?.host && req.url?.path) {
      url = (Array.isArray(req.url.host) ? req.url.host.join(".") : req.url.host) +
        "/" + (Array.isArray(req.url.path) ? req.url.path.join("/") : req.url.path);
      if (req.url.protocol) url = req.url.protocol + "://" + url;
    }

    const headers = (req.header || []).map((h: any) => ({
      key: h.key || "",
      value: h.value || "",
    }));

    let body = "";
    if (req.body) {
      if (req.body.raw) body = req.body.raw;
      else if (req.body.formdata) body = JSON.stringify(req.body.formdata, null, 2);
      else if (req.body.urlencoded) body = JSON.stringify(req.body.urlencoded, null, 2);
    }

    const auth = req.auth?.type || "";

    return {
      name: item.name || "Unnamed",
      method,
      url,
      description: item.request?.description || item.description || "",
      headers,
      body,
      auth,
    };
  }

  function parseItems(items: any[]): { folders: ApiFolder[]; endpoints: ApiEndpoint[] } {
    const folders: ApiFolder[] = [];
    const endpoints: ApiEndpoint[] = [];

    (items || []).forEach((item: any) => {
      if (item.item && Array.isArray(item.item)) {
        const sub = parseItems(item.item);
        folders.push({
          name: item.name || "Folder",
          description: item.description || "",
          endpoints: [...sub.endpoints, ...sub.folders.flatMap((f) => f.endpoints)],
        });
      } else {
        const ep = parseEndpoint(item);
        if (ep) endpoints.push(ep);
      }
    });

    return { folders, endpoints };
  }

  const { folders, endpoints } = parseItems(json.item || []);
  return { name, description, baseUrl, folders, endpoints };
}

// ─── AI Explain (calls Genkit REST endpoint at localhost:3400 in dev) ────────
// In production (static export) there is no server — AI requires genkit:dev.
async function explainEndpointWithAI(endpoint: ApiEndpoint): Promise<string> {
  const context = JSON.stringify({
    name: endpoint.name,
    method: endpoint.method,
    url: endpoint.url,
    description: endpoint.description,
    headers: endpoint.headers,
    body: endpoint.body,
    auth: endpoint.auth,
  }, null, 2);

  try {
    const res = await fetch("http://localhost:3400/explainApiResponseFlow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { apiResponse: context } }),
    });

    if (!res.ok) throw new Error(`Genkit responded ${res.status}`);

    const json = await res.json();
    const result = json.result ?? json;

    let explanation = `## ${result.summary ?? "Summary unavailable"}\n\n`;
    if (result.keyFieldsExplanation?.length) {
      explanation += "### Key Fields\n";
      result.keyFieldsExplanation.forEach((f: { fieldName: string; description: string; exampleValue?: string | null }) => {
        explanation += `- **${f.fieldName}**: ${f.description}`;
        if (f.exampleValue) explanation += ` (e.g. \`${f.exampleValue}\`)`;
        explanation += "\n";
      });
    }
    if (result.suggestions?.length) {
      explanation += "\n### Suggestions\n";
      result.suggestions.forEach((s: string) => {
        explanation += `- ${s}\n`;
      });
    }
    return explanation;
  } catch {
    return `**AI explanation requires the Genkit dev server.**\n\nRun \`npm run genkit:dev\` in a separate terminal, then try again.\n\nGenkit must be running at \`http://localhost:3400\`.`;
  }
}

// ─── Add Manual API Dialog ──────────────────────────────────────────────────
function AddManualApiDialog({
  onAdd,
}: {
  onAdd: (endpoint: ApiEndpoint, folderName?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [method, setMethod] = useState<ApiEndpoint["method"]>("GET");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [headersStr, setHeadersStr] = useState("");
  const [body, setBody] = useState("");
  const [folderName, setFolderName] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !url.trim()) return;
    const headers = headersStr
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [key, ...rest] = line.split(":");
        return { key: key?.trim() || "", value: rest.join(":").trim() };
      });
    onAdd(
      { name: name.trim(), method, url: url.trim(), description: description.trim(), headers, body, auth: "" },
      folderName.trim() || undefined
    );
    setName(""); setUrl(""); setDescription(""); setHeadersStr(""); setBody(""); setFolderName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
          <Plus className="h-3 w-3" /> Add API
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add API Endpoint</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <Select value={method} onValueChange={(v) => setMethod(v as ApiEndpoint["method"])}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map((m) => (
                  <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} className="text-sm" />
          </div>
          <Input placeholder="Name (e.g. Get Users)" value={name} onChange={(e) => setName(e.target.value)} className="text-sm" />
          <Input placeholder="Folder (optional)" value={folderName} onChange={(e) => setFolderName(e.target.value)} className="text-sm" />
          <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="text-xs h-16 resize-none" />
          <div className="space-y-1">
            <Label className="text-xs">Headers (one per line: Key: Value)</Label>
            <Textarea placeholder="Content-Type: application/json&#10;Authorization: Bearer token" value={headersStr} onChange={(e) => setHeadersStr(e.target.value)} className="text-xs h-16 font-mono resize-none" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Request Body (JSON)</Label>
            <Textarea placeholder='{"key": "value"}' value={body} onChange={(e) => setBody(e.target.value)} className="text-xs h-16 font-mono resize-none" />
          </div>
          <Button onClick={handleSubmit} disabled={!name.trim() || !url.trim()} className="w-full">
            Add Endpoint
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Endpoint Detail Panel ──────────────────────────────────────────────────
function EndpointDetail({ endpoint }: { endpoint: ApiEndpoint }) {
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleExplain = async () => {
    setAiLoading(true);
    setAiExplanation(null);
    const explanation = await explainEndpointWithAI(endpoint);
    setAiExplanation(explanation);
    setAiLoading(false);
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Method + URL */}
      <div className="flex items-center gap-2">
        <Badge className={cn("text-xs font-bold text-white shrink-0", METHOD_COLORS[endpoint.method])}>
          {endpoint.method}
        </Badge>
        <code className="text-sm font-mono flex-1 truncate">{endpoint.url}</code>
        <button onClick={() => handleCopy(endpoint.url, "url")} className="shrink-0 text-muted-foreground hover:text-foreground">
          {copied === "url" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Description */}
      {endpoint.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{endpoint.description}</p>
      )}

      {/* Headers */}
      {endpoint.headers.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Headers</p>
          <div className="rounded-lg border divide-y divide-border/30">
            {endpoint.headers.map((h, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-xs">
                <code className="font-mono font-semibold text-primary/80">{h.key}</code>
                <span className="text-muted-foreground">:</span>
                <code className="font-mono text-muted-foreground truncate">{h.value}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Body */}
      {endpoint.body && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Request Body</p>
            <button onClick={() => handleCopy(endpoint.body, "body")} className="text-muted-foreground hover:text-foreground">
              {copied === "body" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
          <ScrollArea className="max-h-40 rounded-lg border bg-muted/20 p-3">
            <pre className="text-xs font-mono whitespace-pre-wrap">{endpoint.body}</pre>
          </ScrollArea>
        </div>
      )}

      {/* Auth */}
      {endpoint.auth && (
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Auth:</p>
          <Badge variant="outline" className="text-[10px]">{endpoint.auth}</Badge>
        </div>
      )}

      <Separator />

      {/* AI Explain */}
      <div className="space-y-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleExplain}
          disabled={aiLoading}
          className="h-8 text-xs gap-1.5 border-primary/30 hover:bg-primary/5"
        >
          {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-primary" />}
          {aiLoading ? "Analyzing..." : "AI Explain This API"}
        </Button>
        {aiExplanation && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap">
              {aiExplanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function ApiCollectionManager() {
  const db = useFirestore();
  const { user } = useUser();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [activeEndpoint, setActiveEndpoint] = useState<ApiEndpoint | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(collection(db, "apiProjects"), orderBy("importedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as ApiProject));
      setLoading(false);
    });
    return unsub;
  }, [db]);

  // Import Postman collection
  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setImporting(true);
      setImportError(null);
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const parsed = parsePostmanCollection(json);
        await addDoc(collection(db, "apiProjects"), {
          ...parsed,
          importedAt: new Date().toISOString(),
          importedBy: user?.uid || "anonymous",
          importedByName: user?.displayName || user?.email || "Unknown",
        });
        setImportError(null);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "Failed to parse collection file");
      } finally {
        setImporting(false);
      }
    };
    input.click();
  }, [db, user]);

  // Add manual endpoint to existing project
  const handleAddEndpoint = useCallback(async (projectId: string, endpoint: ApiEndpoint, folderName?: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    let updatedFolders = [...project.folders];
    let updatedEndpoints = [...project.endpoints];

    if (folderName) {
      const existingFolder = updatedFolders.find((f) => f.name === folderName);
      if (existingFolder) {
        existingFolder.endpoints = [...existingFolder.endpoints, endpoint];
      } else {
        updatedFolders.push({ name: folderName, description: "", endpoints: [endpoint] });
      }
    } else {
      updatedEndpoints.push(endpoint);
    }

    const { updateDoc } = await import("firebase/firestore");
    await updateDoc(doc(db, "apiProjects", projectId), {
      folders: updatedFolders,
      endpoints: updatedEndpoints,
    });
  }, [db, projects]);

  // Delete project
  const handleDelete = async (projectId: string) => {
    await deleteDoc(doc(db, "apiProjects", projectId));
    if (activeProject === projectId) {
      setActiveProject(null);
      setActiveEndpoint(null);
    }
  };

  const toggleFolder = (key: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const currentProject = projects.find((p) => p.id === activeProject);

  // Filter endpoints by search
  const filterEndpoints = (endpoints: ApiEndpoint[]): ApiEndpoint[] => {
    if (!searchQuery) return endpoints;
    const q = searchQuery.toLowerCase();
    return endpoints.filter(
      (ep) =>
        ep.name.toLowerCase().includes(q) ||
        ep.url.toLowerCase().includes(q) ||
        ep.method.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q)
    );
  };

  const totalEndpoints = currentProject
    ? currentProject.endpoints.length + currentProject.folders.reduce((s, f) => s + f.endpoints.length, 0)
    : 0;

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">API Collections</CardTitle>
            <Badge variant="outline" className="text-[10px]">{projects.length} project{projects.length !== 1 ? "s" : ""}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleImport} disabled={importing} className="h-7 text-xs gap-1.5 bg-violet-600 hover:bg-violet-700">
              {importing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {importing ? "Importing..." : "Import Postman"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {importError && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 rounded-lg px-3 py-2 border border-destructive/20">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {importError}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Loading collections...</div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border/60 p-8 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">No API collections yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Import a Postman collection JSON to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 min-h-[400px]">
            {/* Left sidebar - Project list */}
            <div className="space-y-3">
              {/* Projects */}
              <ScrollArea className="max-h-[500px] rounded-xl border border-border/50">
                <div className="divide-y divide-border/30">
                  {projects.map((project) => (
                    <div key={project.id} className="group">
                      <button
                        onClick={() => {
                          setActiveProject(project.id);
                          setActiveEndpoint(null);
                          setSearchQuery("");
                        }}
                        className={cn(
                          "flex items-start gap-2 w-full px-3 py-2.5 text-left transition-colors",
                          activeProject === project.id ? "bg-primary/5" : "hover:bg-muted/30"
                        )}
                      >
                        <Globe className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{project.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{project.description || "No description"}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">
                              {project.folders.length} folders
                            </Badge>
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">
                              {project.endpoints.length + project.folders.reduce((s, f) => s + f.endpoints.length, 0)} APIs
                            </Badge>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Right content */}
            {currentProject ? (
              <div className="space-y-3">
                {/* Search + Add */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search APIs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                  <AddManualApiDialog
                    onAdd={(endpoint, folderName) => handleAddEndpoint(currentProject.id, endpoint, folderName)}
                  />
                  <Badge variant="outline" className="text-[10px] shrink-0">{totalEndpoints} endpoints</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-3 min-h-[350px]">
                  {/* Endpoint tree */}
                  <ScrollArea className="max-h-[400px] rounded-xl border border-border/50">
                    <div className="py-1">
                      {/* Root endpoints */}
                      {filterEndpoints(currentProject.endpoints).map((ep, i) => (
                        <EndpointRow
                          key={`root-${i}`}
                          endpoint={ep}
                          isActive={activeEndpoint === ep}
                          onClick={() => setActiveEndpoint(ep)}
                        />
                      ))}

                      {/* Folders */}
                      {currentProject.folders.map((folder, fi) => {
                        const folderKey = `${currentProject.id}-${fi}`;
                        const isExpanded = expandedFolders.has(folderKey);
                        const filteredEps = filterEndpoints(folder.endpoints);
                        if (searchQuery && filteredEps.length === 0) return null;

                        return (
                          <div key={folderKey}>
                            <button
                              onClick={() => toggleFolder(folderKey)}
                              className="flex items-center gap-1.5 w-full px-2 py-1.5 text-left hover:bg-muted/30 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              )}
                              <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
                              <span className="text-xs font-medium truncate">{folder.name}</span>
                              <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-auto">
                                {folder.endpoints.length}
                              </Badge>
                            </button>
                            {isExpanded &&
                              filteredEps.map((ep, ei) => (
                                <EndpointRow
                                  key={`${folderKey}-${ei}`}
                                  endpoint={ep}
                                  isActive={activeEndpoint === ep}
                                  onClick={() => setActiveEndpoint(ep)}
                                  indent
                                />
                              ))}
                          </div>
                        );
                      })}

                      {filterEndpoints(currentProject.endpoints).length === 0 &&
                        currentProject.folders.every((f) => filterEndpoints(f.endpoints).length === 0) && (
                          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                            No APIs match &quot;{searchQuery}&quot;
                          </div>
                        )}
                    </div>
                  </ScrollArea>

                  {/* Endpoint detail */}
                  <div className="rounded-xl border border-border/50 p-4 bg-muted/5">
                    {activeEndpoint ? (
                      <EndpointDetail endpoint={activeEndpoint} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <BookOpen className="h-8 w-8 text-muted-foreground/20 mb-2" />
                        <p className="text-sm text-muted-foreground">Select an API to view its documentation</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 rounded-xl border border-dashed border-border/50">
                <Globe className="h-8 w-8 text-muted-foreground/20 mb-2" />
                <p className="text-sm text-muted-foreground">Select a project to browse its APIs</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Endpoint row ───────────────────────────────────────────────────────────
function EndpointRow({
  endpoint,
  isActive,
  onClick,
  indent,
}: {
  endpoint: ApiEndpoint;
  isActive: boolean;
  onClick: () => void;
  indent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 w-full text-left px-2 py-1.5 transition-colors",
        indent && "pl-7",
        isActive ? "bg-primary/10" : "hover:bg-muted/30"
      )}
    >
      <span className={cn("text-[9px] font-bold w-10 shrink-0 text-center", METHOD_TEXT_COLORS[endpoint.method])}>
        {endpoint.method}
      </span>
      <span className="text-xs truncate">{endpoint.name}</span>
    </button>
  );
}
