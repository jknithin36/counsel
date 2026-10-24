"use client";

import { Component } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { overview } from "@/lib/content/dashboard";

/** Keeps one broken card from taking down the whole page. */
export class CardBoundary extends Component<
  { children: React.ReactNode; className?: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Card className={this.props.className}>
        <CardContent className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
          {overview.error}
        </CardContent>
      </Card>
    );
  }
}
