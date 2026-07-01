"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/wallet-context";
import { saveUserFeedback, fetchUserProfile, logUserActivity } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquarePlus, Star, Send } from "lucide-react";
import { toast } from "sonner";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [easeOfUse, setEaseOfUse] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState(0);
  const [favoriteFeature, setFavoriteFeature] = useState("");
  const [improvement, setImprovement] = useState("");
  const [bugs, setBugs] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !publicKey) return;
    fetchUserProfile(publicKey).then(({ data }) => {
      if (data) {
        setName(data.name);
        setEmail(data.email);
      }
    });
  }, [open, publicKey]);

  const handleSubmit = async () => {
    if (!publicKey) {
      toast.error("Connect your wallet first");
      return;
    }
    if (rating === 0 || easeOfUse === 0 || wouldRecommend === 0) {
      toast.error("Please complete all rating fields");
      return;
    }

    setSubmitting(true);
    const { error } = await saveUserFeedback({
      wallet_address: publicKey,
      name: name.trim(),
      email: email.trim(),
      rating,
      ease_of_use: easeOfUse,
      would_recommend: wouldRecommend,
      favorite_feature: favoriteFeature || null,
      improvement_suggestion: improvement || null,
      experienced_bugs: bugs || null,
    });

    if (error) {
      toast.error("Failed to submit feedback: " + error);
      setSubmitting(false);
      return;
    }

    await logUserActivity(publicKey, "feedback_submitted", `${rating}/5 stars`);

    toast.success("Thank you for your feedback!");
    setRating(0);
    setEaseOfUse(0);
    setWouldRecommend(0);
    setFavoriteFeature("");
    setImprovement("");
    setBugs("");
    setSubmitting(false);
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
    <div className="flex flex-col gap-1.5">
      <Label className="text-foreground text-sm">{label}</Label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5 hover:scale-110 transition-transform"
            aria-label={`${star} star`}
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? "fill-stellar-amber text-stellar-amber"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">{value}/5</span>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <MessageSquarePlus className="h-5 w-5 text-stellar-teal" />
            Share Your Feedback
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Help us improve Divify. Your feedback directly shapes our roadmap.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fb-name" className="text-foreground text-sm">
                Name
              </Label>
              <Input
                id="fb-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-background border-border"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fb-email" className="text-foreground text-sm">
                Email
              </Label>
              <Input
                id="fb-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-background border-border"
              />
            </div>
          </div>

          <StarRating
            value={rating}
            onChange={setRating}
            label="Overall Rating"
          />
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

          <div className="flex flex-col gap-1.5">
            <Label className="text-foreground text-sm">Favorite Feature</Label>
            <div className="flex flex-wrap gap-1.5">
              {FEATURE_OPTIONS.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => setFavoriteFeature(feature)}
                  className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                    favoriteFeature === feature
                      ? "bg-stellar-teal text-primary-foreground border-stellar-teal"
                      : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-stellar-teal/40"
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fb-improve" className="text-foreground text-sm">
              What can we improve?
            </Label>
            <Textarea
              id="fb-improve"
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              placeholder="Suggest features or improvements..."
              className="bg-background border-border min-h-[80px] resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fb-bugs" className="text-foreground text-sm">
              Did you experience any bugs?
            </Label>
            <Textarea
              id="fb-bugs"
              value={bugs}
              onChange={(e) => setBugs(e.target.value)}
              placeholder="Describe any issues you encountered..."
              className="bg-background border-border min-h-[60px] resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-stellar-teal text-primary-foreground hover:bg-stellar-teal/90 gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
