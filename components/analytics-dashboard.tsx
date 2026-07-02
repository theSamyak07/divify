"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AnalyticsSummary {
  totalUsers: number;
  avgRating: number | null;
  feedbackCount: number;
  referralCount: number;
  totalExpenses: number;
  totalXlmSent: number;
}

interface FeedbackRow {
  id: string;
  wallet_address: string;
  name: string;
  rating: number;
  favorite_feature: string;
  created_at: string;
}

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalUsers: 0,
    avgRating: null,
    feedbackCount: 0,
    referralCount: 0,
    totalExpenses: 0,
    totalXlmSent: 0,
  });
  const [recentFeedback, setRecentFeedback] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const [usersRes, feedbackRes, referralsRes, expensesRes] = await Promise.all([
        supabase.from("user_profiles").select("*", { count: "exact", head: true }),
        supabase.from("user_feedback").select("rating"),
        supabase.from("referrals").select("*", { count: "exact", head: true }),
        supabase.from("expenses").select("total_amount_xlm"),
      ]);

      const totalUsers = usersRes.count ?? 0;
      const feedbackCount = feedbackRes.data?.length ?? 0;
      const avgRating =
        feedbackRes.data && feedbackRes.data.length > 0
          ? feedbackRes.data.reduce((sum, f) => sum + f.rating, 0) /
            feedbackRes.data.length
          : null;
      const referralCount = referralsRes.count ?? 0;
      const totalExpenses = expensesRes.data?.length ?? 0;
      const totalXlmSent =
        expensesRes.data?.reduce((sum, e) => sum + e.total_amount_xlm, 0) ?? 0;

      setSummary({
        totalUsers,
        avgRating,
        feedbackCount,
        referralCount,
        totalExpenses,
        totalXlmSent,
      });

      const { data: recentFb } = await supabase
        .from("user_feedback")
        .select("id, wallet_address, name, rating, favorite_feature, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentFeedback(recentFb ?? []);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const statCards = [
    { label: "Total Users", value: summary.totalUsers, suffix: summary.totalUsers >= 50 ? " ✓" : ` / 50` },
    { label: "Avg Rating", value: summary.avgRating?.toFixed(2) ?? "N/A", suffix: "/5" },
    { label: "Feedback Count", value: summary.feedbackCount, suffix: "" },
    { label: "Referrals", value: summary.referralCount, suffix: "" },
    { label: "Total Expenses", value: summary.totalExpenses, suffix: "" },
    { label: "XLM Sent", value: summary.totalXlmSent.toFixed(2), suffix: " XLM" },
  ];

  const progressPercent = Math.min(100, (summary.totalUsers / 50) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analytics Overview</h3>
        <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statCards.map(({ label, value, suffix }) => (
          <Card key={label}>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs text-muted-foreground font-medium">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <p className="text-xl font-bold">
                {value}
                <span className="text-sm font-normal text-muted-foreground">{suffix}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-sm font-medium">User Onboarding Goal</CardTitle>
        </CardHeader>
        <CardContent className="pb-3 px-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-stellar-teal transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {summary.totalUsers}/50 users
            </span>
          </div>
        </CardContent>
      </Card>

      {recentFeedback.length > 0 && (
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-3 space-y-2">
            {recentFeedback.map((fb) => (
              <div key={fb.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate max-w-[120px]">{fb.name}</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i <= fb.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                  {fb.favorite_feature}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
