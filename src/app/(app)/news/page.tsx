"use client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";
import { Newspaper, Clock, User2, Loader2 } from "lucide-react";
import { useNews } from "@/hooks/use-firestore-data";

export default function NewsPage() {
  const { news, loading } = useNews();

  return (
    <div className="space-y-6 sm:space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm"><Newspaper className="h-4 w-4" /></div>
            <span className="text-sm font-medium text-muted-foreground">Stay Informed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text">News & Events</h1>
          <p className="text-muted-foreground text-sm mt-1">Latest announcements and activities from ITG.</p>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto text-sm px-3 py-1">{news.length} articles</Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-6 sm:gap-8">
          {news.map((article, i) => (
            <Card key={article.id} className="card-hover overflow-hidden border-0 shadow-md">
              <div className="relative h-48 sm:h-64 w-full overflow-hidden">
                <Image src={article.imageUrl} alt={article.title} fill className="object-cover transition-transform duration-500 hover:scale-105" data-ai-hint={article.imageHint} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute top-4 left-4"><Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm text-xs">#{String(i + 1).padStart(2, "0")}</Badge></div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardHeader className="px-4 sm:px-6 pt-5 pb-3"><h2 className="text-xl sm:text-2xl font-bold leading-snug">{article.title}</h2></CardHeader>
              <CardContent className="px-4 sm:px-6 pb-3"><p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{article.content}</p></CardContent>
              <CardFooter className="px-4 sm:px-6 pb-5 flex flex-wrap items-center gap-3 border-t border-border/50 pt-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><User2 className="h-3.5 w-3.5 text-blue-500" /><span className="font-medium">{article.author}</span></div>
                <div className="h-3.5 w-px bg-border" />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5 text-blue-500" /><span>{format(new Date(article.publishedDate), "MMMM d, yyyy")}</span></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
