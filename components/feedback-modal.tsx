"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useWallet } from "@/lib/wallet-context";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

const FEATURE_OPTIONS = [
  "Expense Splitter",
  "Multi-Wallet Support",
  "Quick Send",
  "Activity Feed",
  "Contract Events",
  "Onboarding Flow",
  "Mobile Experience",
];

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const { publicKey } = useWallet();
  const [ submitting, setSubmitting ] = useState(false);
  const [ submitted, setSubmitted ] = useState(false);

  const [ ratings, setRatings ] = useState({
    overall: 0,
    easeOfUse: 0,
    wouldRecommend: 0,
  });
  const [ favoriteFeature, setFavoriteFeature ] = useState("");
  const [ suggestion, setSuggestion ] = useState("");
  const [ bugs, setBugs ] = useState("");

  async function handleSubmit() {
    if (!publicKey || ratings.overall === 0) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("user_feedback").insert({
        wallet_address: publicKey,
        name: "User",
        email: `user@divify.app`,
        rating: ratings.overall,
        ease_of_use: ratings.easeOfUse,
        would_recommend: ratings.wouldRecommend,
        favorite_feature: favoriteFeature || null,
        improvement_suggestion: suggestion || null,
        experienced_bugs: bugs || null,
      });

      if (error) throw error;

      await supabase.from("user_activity").insert({
        wallet_address: publicKey,
        action_type: "feedback_submitted",
        action_detail: `${ratings.overall}/5 stars`,
        tx_hash: null,
        amount_xlm: null,
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setSubmitted(false);
    setRatings({ overall: 0, easeOfUse: 0, wouldRecommend: 0 });
    setFavoriteFeature("");
    setSuggestion("");
    setBugs("");
    onClose();
  }

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
        <p className="text-sm font-medium">{label}</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              className="focus:outline-none focus:ring-2 focus:ring-stellar-teal rounded"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  i <= value
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-muted-foreground/30 hover:text-muted-foreground/50"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thank you for your feedback!</DialogTitle>
            <DialogDescription>
              Your input helps us improve Divify for everyone.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleClose} className="w-full bg-stellar-teal text-primary-foreground">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us understand your experience with Divify.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <StarRating
            label="Overall Rating"
            value={ratings.overall}
            onChange={(v) => setRatings((r) => ({ ...r, overall: v }))}
          />
          <StarRating
            label="Ease of Use"
            value={ratings.easeOfUse}
            onChange={(v) => setRatings((r) => ({ ...r, easeOfUse: v }))}
          />
          <StarRating
            label="Would Recommend"
            value={ratings.wouldRecommend}
            onChange={(v) => setRatings((r) => ({ ...r, wouldRecommend: v }))}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Favorite Feature</p>
            <div className="flex flex-wrap gap-2">
              {FEATURE_OPTIONS.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => setFavoriteFeature(feature)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    favoriteFeature === feature
                      ? "bg-stellar-teal text-primary-foreground border-stellar-teal"
                      : "bg-background border-border hover:bg-secondary"
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Improvement Suggestions</p>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="What would make Divify better?"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-stellar-teal"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Bugs Experienced</p>
            <textarea
              value={bugs}
              onChange={(e) => setBugs(e.target.value)}
              placeholder="Any issues we should know about?"
              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-stellar-teal"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || ratings.overall === 0}
            className="flex-1 bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
