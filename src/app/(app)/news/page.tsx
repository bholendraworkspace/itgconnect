import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { news } from "@/lib/data";
import { format } from "date-fns";
import Image from "next/image";

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">News & Events</h1>
        <p className="text-muted-foreground">
          Stay up-to-date with the latest announcements and activities.
        </p>
      </div>

      <div className="grid gap-8">
        {news.map((article) => (
          <Card key={article.id} className="overflow-hidden">
            <div className="relative h-60 w-full">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                data-ai-hint={article.imageHint}
              />
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{article.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{article.content}</p>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              <p>
                Posted by {article.author} on{" "}
                {format(new Date(article.publishedDate), "MMMM d, yyyy")}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
