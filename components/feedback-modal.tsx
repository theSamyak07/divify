"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import {
  saveUserFeedback,
  hasSubmittedFeedback,
  type UserFeedback,
} from "@/lib/local-storage";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

const FEATURE_OPTIONS = [
  "Quick Send",
  "Expense Splitter",
  "Multi-Wallet Support",
  "Contract Events",
  "Activity Feed",
  "Mobile Experience",
  "Analytics Dashboard",
  "Onboarding Flow",
];

const GOOGLE_FORM_URL =
  "https://forms.gle/divify-feedback";

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const { publicKey } = useWallet();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [easeOfUse, setEaseOfUse] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState(0);
  const [favoriteFeature, setFavoriteFeature] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [bugs, setBugs] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Check if already submitted
  const alreadySubmitted = publicKey ? hasSubmittedFeedback(publicKey) : false;

  const handleSubmit = async () => {
    if (!publicKey || rating === 0) return;

    setSubmitting(true);

    // Save to localStorage (instant, no server needed)
    saveUserFeedback({
      wallet_address: publicKey,
      name,
      email,
      rating,
      ease_of_use: easeOfUse || rating,
      would_recommend: wouldRecommend || rating,
      favorite_feature: favoriteFeature || null,
      improvement_suggestion: suggestion || null,
      experienced_bugs: bugs || null,
    } satisfies Omit<UserFeedback, "id" | "created_at">);

    setSubmitting(false);
    setSubmitted(true);
  };

  const handleClose = () => {
    setRating(0);
    setEaseOfUse(0);
    setWouldRecommend(0);
    setFavoriteFeature("");
    setSuggestion("");
    setBugs("");
    setName("");
    setEmail("");
    setSubmitted(false);
    onClose();
  };

  function StarRating({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (v: number) => void;
    label: string;
  }) {
    return (
      <div className="space-y-1">
        <Label className="text-sm">{label}</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= value
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground hover:text-yellow-300"
                }`}
              />
            </button>
          ))}
          {value > 0 && (
            <span className="text-xs text-muted-foreground self-center ml-1">
              {["", "Poor", "Fair", "Good", "Great", "Excellent"][value]}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (submitted || alreadySubmitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">Thank you for your feedback!</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Your input helps us improve Divify for everyone on Stellar.
            </p>
            <div className="mt-4 rounded-lg bg-muted p-3 text-left w-full">
              <p className="text-xs text-muted-foreground mb-2">
                Also fill out our official Google Form to be counted in the Blue Belt submission:
              </p>
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-stellar-teal hover:underline font-medium"
              >
                Open Google Form <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Button onClick={handleClose} className="mt-4 bg-stellar-teal hover:bg-stellar-teal/90">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Share Your Feedback
            <Badge variant="outline" className="text-[10px]">Level 5</Badge>
          </DialogTitle>
          <DialogDescription>
            Help us improve Divify by sharing your experience. Takes under a minute.
          </DialogDescription>
        </DialogHeader>

        {!publicKey && (
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            Connect your wallet first to submit feedback tied to your address.
          </div>
        )}

        <div className="space-y-4 py-2">
          {/* Name + email for identification */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <StarRating value={rating} onChange={setRating} label="Overall Rating *" />
          <StarRating value={easeOfUse} onChange={setEaseOfUse} label="Ease of Use" />
          <StarRating value={wouldRecommend} onChange={setWouldRecommend} label="Would Recommend" />

          <div className="space-y-2">
            <Label className="text-sm">Favorite Feature</Label>
            <div className="flex flex-wrap gap-1.5">
              {FEATURE_OPTIONS.map((feature) => (
                <Badge
                  key={feature}
                  variant={favoriteFeature === feature ? "default" : "outline"}
                  className="cursor-pointer transition-colors hover:bg-accent"
                  onClick={() =>
                    setFavoriteFeature(favoriteFeature === feature ? "" : feature)
                  }
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Improvement Suggestions</Label>
            <Textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="What could make Divify better?"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Bugs or Issues</Label>
            <Textarea
              value={bugs}
              onChange={(e) => setBugs(e.target.value)}
              placeholder="Did you encounter any bugs?"
              rows={2}
            />
          </div>

          {publicKey && (
            <p className="text-[11px] text-muted-foreground">
              Submitting as{" "}
              <span className="font-mono">
                {publicKey.slice(0, 6)}…{publicKey.slice(-4)}
              </span>
            </p>
          )}
        </div>

        <div className="flex justify-between items-center gap-2">
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-stellar-teal transition-colors"
          >
            Google Form <ExternalLink className="h-3 w-3" />
          </a>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!publicKey || rating === 0 || submitting}
              className="bg-stellar-teal hover:bg-stellar-teal/90"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
