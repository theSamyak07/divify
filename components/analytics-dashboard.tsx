"use client";

import { useState, useEffect } from "react";
import {
  fetchAnalyticsSummary,
  fetchAllFeedback,
  type AnalyticsSummary,
  type UserFeedbackRow,
} from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Star,
  TrendingUp,
  Activity,
  Gift,
  DollarSign,
  RefreshCw,
  Loader2,
  MessageSquare,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export function AnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [feedback, setFeedback] = useState<UserFeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [summaryRes, feedbackRes] = await Promise.all([
      fetchAnalyticsSummary(),
      fetchAllFeedback(),
    ]);
    if (summaryRes.data) setSummary(summaryRes.data);
    if (feedbackRes.data) setFeedback(feedbackRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success("Analytics refreshed");
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-stellar-teal" />
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: "Total Users",
      value: summary?.totalUsers ?? 0,
      icon: Users,
      color: "text-stellar-teal",
      bgColor: "bg-stellar-teal/10",
      target: 50,
    },
    {
      label: "Avg Rating",
      value: summary?.avgRating ?? 0,
      suffix: "/5",
      icon: Star,
      color: "text-stellar-amber",
      bgColor: "bg-stellar-amber/10",
    },
    {
      label: "Feedback Count",
      value: summary?.totalFeedback ?? 0,
      icon: MessageSquare,
      color: "text-stellar-blue",
      bgColor: "bg-stellar-blue/10",
    },
    {
      label: "Referrals",
      value: summary?.totalReferrals ?? 0,
      icon: Gift,
      color: "text-stellar-green",
      bgColor: "bg-stellar-green/10",
    },
    {
      label: "Total Expenses",
      value: summary?.totalExpenses ?? 0,
      icon: Activity,
      color: "text-stellar-teal",
      bgColor: "bg-stellar-teal/10",
    },
    {
      label: "XLM Sent",
      value: summary?.totalXlmSent ?? 0,
      suffix: " XLM",
      icon: Zap,
      color: "text-stellar-amber",
      bgColor: "bg-stellar-amber/10",
    },
  ];

  const userProgress = Math.min(((summary?.totalUsers ?? 0) / 50) * 100, 100);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-stellar-teal" />
            Growth Analytics
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            User growth and product metrics
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="border-border gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* User growth progress bar */}
        <div className="rounded-lg border border-stellar-teal/20 bg-stellar-teal/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              User Onboarding Progress
            </span>
            <Badge
              variant="outline"
              className="border-stellar-teal/40 text-stellar-teal text-xs"
            >
              {summary?.totalUsers ?? 0} / 50
            </Badge>
          </div>
          <div className="h-2 w-full rounded-full bg-background overflow-hidden">
            <div
              className="h-full rounded-full bg-stellar-teal transition-all duration-500"
              style={{ width: `${userProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {userProgress >= 100
              ? "Goal reached! Thank you to all our users."
              : `${(50 - (summary?.totalUsers ?? 0))} more users needed to reach the 50-user goal`}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon, color, bgColor, suffix, target }) => (
            <div
              key={label}
              className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bgColor}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                {target && (
                  <span className="text-[10px] text-muted-foreground">
                    /{target}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">
                  {value}
                  {suffix && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {suffix}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent feedback */}
        {feedback.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-stellar-blue" />
              <span className="text-sm font-medium text-foreground">
                Recent Feedback
              </span>
            </div>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {feedback.slice(0, 5).map((fb) => (
                <div
                  key={fb.id}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {fb.name || "Anonymous"}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s <= fb.rating
                              ? "fill-stellar-amber text-stellar-amber"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {fb.improvement_suggestion && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {fb.improvement_suggestion}
                    </p>
                  )}
                  {fb.favorite_feature && (
                    <Badge
                      variant="outline"
                      className="mt-1.5 text-[10px] border-stellar-teal/30 text-stellar-teal"
                    >
                      {fb.favorite_feature}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
