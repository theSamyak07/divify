"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Receipt,
  Coins,
  MessageSquare,
  Gift,
  Activity,
  TrendingUp,
} from "lucide-react";
import { getAnalyticsStats, type AnalyticsStats } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, description, icon: Icon, color }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const { data, error: err } = await getAnalyticsStats();
      if (err) {
        setError(err);
      } else {
        setStats(data);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-1">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">Failed to load analytics: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Platform Analytics</h3>
        <Badge variant="outline" className="ml-auto">
          Live Data
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          description="Wallets connected to Divify"
          icon={Users}
          color="text-blue-500"
        />
        <StatCard
          title="Expenses Split"
          value={stats.totalExpenses.toLocaleString()}
          description="Group expense records"
          icon={Receipt}
          color="text-green-500"
        />
        <StatCard
          title="XLM Transacted"
          value={`${stats.totalXlm.toLocaleString()} XLM`}
          description="Total value on Stellar testnet"
          icon={Coins}
          color="text-yellow-500"
        />
        <StatCard
          title="User Feedback"
          value={stats.feedbackCount.toLocaleString()}
          description="Ratings and reviews submitted"
          icon={MessageSquare}
          color="text-purple-500"
        />
        <StatCard
          title="Referrals"
          value={stats.referralCount.toLocaleString()}
          description="Users invited to the platform"
          icon={Gift}
          color="text-pink-500"
        />
        <StatCard
          title="Activity Events"
          value={stats.activityCount.toLocaleString()}
          description="Total actions logged"
          icon={Activity}
          color="text-orange-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Level 5 Blue Belt Achievement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{stats.totalUsers}+ users onboarded</Badge>
            <Badge variant="secondary">{stats.totalXlm.toLocaleString()} XLM volume</Badge>
            <Badge variant="secondary">{stats.feedbackCount} feedback entries</Badge>
            <Badge variant="secondary">{stats.referralCount} referrals</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
