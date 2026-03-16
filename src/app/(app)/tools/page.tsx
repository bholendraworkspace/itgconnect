import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonViewer } from "@/components/tools/json-viewer";
import { HtmlViewer } from "@/components/tools/html-viewer";
import { Base64Tool } from "@/components/tools/base64-tool";
import { TimestampConverter } from "@/components/tools/timestamp-converter";
import { ApiExplainer } from "@/components/tools/api-explainer";
import { PageSpeedReport } from "@/components/tools/page-speed";

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Developer Tools</h1>
        <p className="text-muted-foreground">
          A collection of essential utilities to make your work easier.
        </p>
      </div>

      <Tabs defaultValue="api-explainer" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="api-explainer">AI Explainer</TabsTrigger>
          <TabsTrigger value="json-viewer">JSON Viewer</TabsTrigger>
          <TabsTrigger value="html-viewer">HTML Viewer</TabsTrigger>
          <TabsTrigger value="base64">Base64</TabsTrigger>
          <TabsTrigger value="timestamp">Timestamp</TabsTrigger>
          <TabsTrigger value="pagespeed">Page Speed</TabsTrigger>
        </TabsList>
        <TabsContent value="api-explainer">
          <ApiExplainer />
        </TabsContent>
        <TabsContent value="json-viewer">
          <JsonViewer />
        </TabsContent>
        <TabsContent value="html-viewer">
          <HtmlViewer />
        </TabsContent>
        <TabsContent value="base64">
          <Base64Tool />
        </TabsContent>
        <TabsContent value="timestamp">
          <TimestampConverter />
        </TabsContent>
        <TabsContent value="pagespeed">
          <PageSpeedReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
