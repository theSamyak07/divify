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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Loader2, CheckCircle } from "lucide-react";
import { saveUserFeedback } from "@/lib/supabase";

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

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const { address } = useWallet();
  const [rating, setRating] = useState(0);
  const [easeOfUse, setEaseOfUse] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState(0);
  const [favoriteFeature, setFavoriteFeature] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [bugs, setBugs] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!address || rating === 0) return;

    setSubmitting(true);
    const { error } = await saveUserFeedback({
      wallet_address: address,
      name: "",
      email: "",
      rating,
      ease_of_use: easeOfUse,
      would_recommend: wouldRecommend,
      favorite_feature: favoriteFeature || null,
      improvement_suggestion: suggestion || null,
      experienced_bugs: bugs || null,
    });

    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
    }
  };

  const handleClose = () => {
    setRating(0);
    setEaseOfUse(0);
    setWouldRecommend(0);
    setFavoriteFeature("");
    setSuggestion("");
    setBugs("");
    setSubmitted(false);
    onClose();
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (v: number) => void;
    label: string;
  }) => (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= value ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">Thank you for your feedback!</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Your input helps us improve Divify for everyone.
            </p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve Divify by sharing your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <StarRating value={rating} onChange={setRating} label="Overall Rating *" />

          <StarRating
            value={easeOfUse}
            onChange={setEaseOfUse}
            label="Ease of Use"
          />

          <StarRating
            value={wouldRecommend}
            onChange={setWouldRecommend}
            label="Would Recommend"
          />

          <div className="space-y-2">
            <Label className="text-sm">Favorite Feature</Label>
            <div className="flex flex-wrap gap-1">
              {FEATURE_OPTIONS.map((feature) => (
                <Badge
                  key={feature}
                  variant={favoriteFeature === feature ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFavoriteFeature(feature)}
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Improvement Suggestions</Label>
            <Textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="What could make Divify better?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Bugs or Issues</Label>
            <Textarea
              value={bugs}
              onChange={(e) => setBugs(e.target.value)}
              placeholder="Did you encounter any bugs?"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="bg-stellar-teal hover:bg-stellar-teal/90"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
