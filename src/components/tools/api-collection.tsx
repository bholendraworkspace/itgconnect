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
  Loader2,
  Globe,
  Copy,
  Check,
  Plus,
  BookOpen,
  AlertCircle,
  Clock,
  KeyRound,
  Pencil,
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseUrl(raw: string) {
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const pathParams = (u.pathname.match(/\{[^}]+\}|:[a-zA-Z_]+/g) || []).map((p) =>
      p.startsWith(":") ? p.slice(1) : p.slice(1, -1)
    );
    const queryParams = Array.from(u.searchParams.entries()).map(([key, value]) => ({ key, value }));
    return { base: `${u.protocol}//${u.host}`, path: u.pathname, pathParams, queryParams };
  } catch {
    return { base: "", path: raw, pathParams: [] as string[], queryParams: [] as { key: string; value: string }[] };
  }
}

function formatJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

/** Renders a markdown-like description into structured React elements */
function RenderedDescription({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-1 pl-4">
          {listItems.map((item, i) => (
            <li key={i} className="text-xs text-muted-foreground leading-relaxed list-disc">
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) { flushList(); continue; }

    // Headers
    const h1 = line.match(/^#\s+(.+)$/);
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);

    if (h3) {
      flushList();
      elements.push(<h4 key={`h3-${i}`} className="text-xs font-bold mt-3 mb-1"><InlineMarkdown text={h3[1]} /></h4>);
    } else if (h2) {
      flushList();
      elements.push(<h3 key={`h2-${i}`} className="text-sm font-bold mt-4 mb-1.5 border-b border-border/40 pb-1"><InlineMarkdown text={h2[1]} /></h3>);
    } else if (h1) {
      flushList();
      elements.push(<h2 key={`h1-${i}`} className="text-sm font-bold mt-3 mb-1"><InlineMarkdown text={h1[1]} /></h2>);
    } else if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
    } else {
      flushList();
      elements.push(<p key={`p-${i}`} className="text-xs text-muted-foreground leading-relaxed"><InlineMarkdown text={line} /></p>);
    }
  }
  flushList();

  return <div className="space-y-1">{elements}</div>;
}

/** Renders inline markdown: **bold**, `code`, *italic* */
function InlineMarkdown({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  // Split on **bold**, `code`, *italic*
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    if (match[2]) {
      parts.push(<strong key={key++} className="font-semibold text-foreground">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<code key={key++} className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono text-primary/80">{match[3]}</code>);
    } else if (match[4]) {
      parts.push(<em key={key++}>{match[4]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }
  return <>{parts}</>;
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function DetailSection({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
        {actions}
      </div>
      {children}
    </div>
  );
}

// ─── Endpoint Detail Panel ──────────────────────────────────────────────────
function EndpointDetail({ endpoint, onEdit, onDelete }: { endpoint: ApiEndpoint; onEdit?: () => void; onDelete?: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button onClick={() => handleCopy(text, id)} className="text-muted-foreground hover:text-foreground transition-colors">
      {copied === id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
    </button>
  );

  const parsed = parseUrl(endpoint.url);
  const formattedBody = endpoint.body ? formatJson(endpoint.body) : "";

  return (
    <div className="space-y-4">
      {/* ── Header: Method + Name + Actions ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge className={cn("text-[10px] font-bold text-white shrink-0 px-2 py-0.5", METHOD_COLORS[endpoint.method])}>
            {endpoint.method}
          </Badge>
          <h3 className="text-sm font-bold truncate">{endpoint.name}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button onClick={onEdit} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" title="Edit endpoint">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete endpoint">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <Separator />

      {/* ── Description / API Documentation ── */}
      {endpoint.description && (
        <DetailSection title="Description">
          <ScrollArea className="max-h-60 rounded-lg border bg-muted/10 p-3 overflow-auto">
            <RenderedDescription text={endpoint.description} />
          </ScrollArea>
        </DetailSection>
      )}

      {/* ── URL ── */}
      <DetailSection
        title="Request URL"
        actions={<CopyBtn text={endpoint.url} id="url" />}
      >
        <div className="rounded-lg border bg-muted/20 px-3 py-2 font-mono text-xs break-all">
          {parsed.base && <span className="text-muted-foreground">{parsed.base}</span>}
          <span className="text-foreground font-semibold">{parsed.path}</span>
        </div>
      </DetailSection>

      {/* ── Path Parameters ── */}
      {parsed.pathParams.length > 0 && (
        <DetailSection title="Path Parameters">
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30 border-b">
                  <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Parameter</th>
                  <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Type</th>
                </tr>
              </thead>
              <tbody>
                {parsed.pathParams.map((p, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-1.5 font-mono text-primary/80">{p}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">string</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DetailSection>
      )}

      {/* ── Query Parameters ── */}
      {parsed.queryParams.length > 0 && (
        <DetailSection title="Query Parameters">
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30 border-b">
                  <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Key</th>
                  <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Value</th>
                </tr>
              </thead>
              <tbody>
                {parsed.queryParams.map((q, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-1.5 font-mono text-primary/80">{q.key}</td>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground truncate max-w-[200px]">{q.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DetailSection>
      )}

      {/* ── Headers ── */}
      {endpoint.headers.length > 0 && (
        <DetailSection title="Headers">
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30 border-b">
                  <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Key</th>
                  <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Value</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.headers.map((h, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-1.5 font-mono font-semibold text-primary/80 whitespace-nowrap">{h.key}</td>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground truncate max-w-[250px]">{h.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DetailSection>
      )}

      {/* ── Auth ── */}
      {endpoint.auth && (
        <DetailSection title="Authentication">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
            <KeyRound className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="text-xs font-medium">{endpoint.auth}</span>
          </div>
        </DetailSection>
      )}

      {/* ── Request Body ── */}
      {formattedBody && (
        <DetailSection
          title="Request Body"
          actions={<CopyBtn text={formattedBody} id="body" />}
        >
          <div className="max-h-52 overflow-y-auto rounded-lg border bg-slate-950 dark:bg-slate-900 p-3">
            <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap break-all text-slate-300">{formattedBody}</pre>
          </div>
        </DetailSection>
      )}
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
  const [editingEndpoint, setEditingEndpoint] = useState<ApiEndpoint | null>(null);

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

  const currentProject = projects.find((p) => p.id === activeProject);

  // Delete project
  const handleDelete = async (projectId: string) => {
    await deleteDoc(doc(db, "apiProjects", projectId));
    if (activeProject === projectId) {
      setActiveProject(null);
      setActiveEndpoint(null);
    }
  };

  // Delete a single endpoint from a project
  const handleDeleteEndpoint = useCallback(async (endpoint: ApiEndpoint) => {
    if (!currentProject) return;
    const { updateDoc } = await import("firebase/firestore");
    const updatedEndpoints = currentProject.endpoints.filter((ep) => ep !== endpoint);
    const updatedFolders = currentProject.folders.map((f) => ({
      ...f,
      endpoints: f.endpoints.filter((ep) => ep !== endpoint),
    }));
    await updateDoc(doc(db, "apiProjects", currentProject.id), { endpoints: updatedEndpoints, folders: updatedFolders });
    setActiveEndpoint(null);
  }, [db, currentProject]);

  // Update a single endpoint in a project
  const handleUpdateEndpoint = useCallback(async (oldEp: ApiEndpoint, newEp: ApiEndpoint) => {
    if (!currentProject) return;
    const { updateDoc } = await import("firebase/firestore");
    const updatedEndpoints = currentProject.endpoints.map((ep) => ep === oldEp ? newEp : ep);
    const updatedFolders = currentProject.folders.map((f) => ({
      ...f,
      endpoints: f.endpoints.map((ep) => ep === oldEp ? newEp : ep),
    }));
    await updateDoc(doc(db, "apiProjects", currentProject.id), { endpoints: updatedEndpoints, folders: updatedFolders });
    setActiveEndpoint(newEp);
    setEditingEndpoint(null);
  }, [db, currentProject]);

  const toggleFolder = (key: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

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
                {/* Project Summary */}
                <div className="rounded-xl border border-border/50 bg-muted/10 p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold truncate">{currentProject.name}</h3>
                      {currentProject.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{currentProject.description}</p>
                      )}
                    </div>
                    <AddManualApiDialog
                      onAdd={(endpoint, folderName) => handleAddEndpoint(currentProject.id, endpoint, folderName)}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {totalEndpoints} endpoint{totalEndpoints !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <FolderOpen className="h-3 w-3" />
                      {currentProject.folders.length} folder{currentProject.folders.length !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Imported {new Date(currentProject.importedAt).toLocaleDateString()} by {currentProject.importedByName}
                    </span>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search APIs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
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
                  <div className="rounded-xl border border-border/50 p-4 bg-muted/5 min-w-0 overflow-hidden">
                    {activeEndpoint ? (
                      <EndpointDetail
                        endpoint={activeEndpoint}
                        onEdit={() => setEditingEndpoint(activeEndpoint)}
                        onDelete={() => handleDeleteEndpoint(activeEndpoint)}
                      />
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

      {/* Edit Endpoint Dialog */}
      {editingEndpoint && (
        <EditEndpointDialog
          endpoint={editingEndpoint}
          onSave={(updated) => handleUpdateEndpoint(editingEndpoint, updated)}
          onClose={() => setEditingEndpoint(null)}
        />
      )}
    </Card>
  );
}

// ─── Edit Endpoint Dialog ────────────────────────────────────────────────────
function EditEndpointDialog({
  endpoint,
  onSave,
  onClose,
}: {
  endpoint: ApiEndpoint;
  onSave: (updated: ApiEndpoint) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(endpoint.name);
  const [method, setMethod] = useState<ApiEndpoint["method"]>(endpoint.method);
  const [url, setUrl] = useState(endpoint.url);
  const [description, setDescription] = useState(endpoint.description);
  const [headersStr, setHeadersStr] = useState(
    endpoint.headers.map((h) => `${h.key}: ${h.value}`).join("\n")
  );
  const [body, setBody] = useState(endpoint.body);

  const handleSubmit = () => {
    if (!name.trim() || !url.trim()) return;
    const headers = headersStr
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [key, ...rest] = line.split(":");
        return { key: key?.trim() || "", value: rest.join(":").trim() };
      });
    onSave({
      name: name.trim(),
      method,
      url: url.trim(),
      description: description.trim(),
      headers,
      body,
      auth: endpoint.auth,
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Endpoint</DialogTitle>
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
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="text-sm" />
          <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="text-xs h-20 resize-none" />
          <div className="space-y-1">
            <Label className="text-xs">Headers (one per line: Key: Value)</Label>
            <Textarea value={headersStr} onChange={(e) => setHeadersStr(e.target.value)} className="text-xs h-16 font-mono resize-none" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Request Body (JSON)</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="text-xs h-16 font-mono resize-none" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} disabled={!name.trim() || !url.trim()} className="flex-1">Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
  const shortPath = (() => {
    try {
      const u = new URL(endpoint.url.startsWith("http") ? endpoint.url : `https://${endpoint.url}`);
      return u.pathname;
    } catch {
      return "";
    }
  })();

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-1.5 w-full text-left px-2 py-2 transition-colors",
        indent && "pl-7",
        isActive ? "bg-primary/10" : "hover:bg-muted/30"
      )}
    >
      <Badge variant="outline" className={cn("text-[8px] font-bold shrink-0 px-1 py-0 mt-0.5 border-0", METHOD_TEXT_COLORS[endpoint.method])}>
        {endpoint.method}
      </Badge>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{endpoint.name}</p>
        {shortPath && <p className="text-[10px] font-mono text-muted-foreground truncate">{shortPath}</p>}
      </div>
    </button>
  );
}
