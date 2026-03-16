"use client";

import { useState } from "react";
import { useUser } from "@/firebase";
import { useFirestore } from "@/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  MessageSquarePlus,
  CheckCircle2,
  Send,
  Lightbulb,
  Bug,
  Heart,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Category = "suggestion" | "bug" | "praise" | "other";

interface CategoryOption {
  value: Category;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const categories: CategoryOption[] = [
  {
    value: "suggestion",
    label: "Suggestion",
    icon: Lightbulb,
    color: "text-amber-500",
  },
  {
    value: "bug",
    label: "Bug Report",
    icon: Bug,
    color: "text-red-500",
  },
  {
    value: "praise",
    label: "Praise",
    icon: Heart,
    color: "text-pink-500",
  },
  {
    value: "other",
    label: "Other",
    icon: HelpCircle,
    color: "text-muted-foreground",
  },
];

export default function FeedbackPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [category, setCategory] = useState<Category>("suggestion");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({ title: "Message required", description: "Please write your feedback before submitting.", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Not signed in", description: "You must be signed in to submit feedback.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "feedback"), {
        submitterId: user.uid,
        submitterName: isAnonymous ? "Anonymous" : (user.displayName || user.email || "Unknown"),
        isAnonymous,
        category,
        message: message.trim(),
        date: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast({ title: "Submission failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCategory("suggestion");
    setMessage("");
    setIsAnonymous(false);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up">
        <Card className="w-full max-w-md text-center border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-rose-500 to-accent" />
          <CardContent className="p-10 space-y-5">
            <div className="flex justify-center gap-3 text-4xl">
              <span>🎉</span>
              <span>✨</span>
              <span>🙌</span>
            </div>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Thank you!</h2>
              <p className="mt-2 text-muted-foreground text-sm">
                Your feedback has been received. We appreciate you taking the time to share your thoughts.
              </p>
            </div>
            <Button
              onClick={handleReset}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-md shadow-primary/30"
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              Submit Another
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-sm">
            <MessageSquarePlus className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Your Voice</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text">
          Share Feedback
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Help us improve ITGConnect. Every piece of feedback matters.
        </p>
      </div>

      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-rose-500 to-accent" />
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">New Feedback</CardTitle>
          <CardDescription>
            Submitting as{" "}
            <span className="font-medium text-foreground">
              {isAnonymous ? "Anonymous" : (user?.displayName || user?.email || "you")}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-xs font-medium transition-all",
                        isSelected
                          ? "border-primary bg-gradient-to-br from-primary/10 to-accent/10 text-foreground shadow-sm"
                          : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-muted/60"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isSelected ? cat.color : "")} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Describe your feedback in detail..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="rounded-xl resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                {message.length} characters
              </p>
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">
                  Submit anonymously
                </Label>
                <p className="text-xs text-muted-foreground">
                  Your name will not be shown with this feedback
                </p>
              </div>
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting || !message.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-md shadow-primary/30 disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
