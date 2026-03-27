"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Brain, ThumbsUp, ThumbsDown, Pencil, RotateCcw,
  Trash2, FileText, Sparkles, ToggleLeft, ToggleRight,
  CheckCircle, AlertTriangle, Activity
} from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  accuracy: number;
  lastTrained: string;
  feedbackSignals: number;
  status: "good" | "low_data" | "retrain";
}

const MODELS: AIModel[] = [
  {
    id: "rec-cf",
    name: "Recommendation (Collaborative Filtering)",
    accuracy: 73,
    lastTrained: "2026-03-20",
    feedbackSignals: 1842,
    status: "good",
  },
  {
    id: "demand-fc",
    name: "Demand Forecast",
    accuracy: 84,
    lastTrained: "2026-03-22",
    feedbackSignals: 3210,
    status: "good",
  },
  {
    id: "churn-pred",
    name: "Churn Predictor",
    accuracy: 71,
    lastTrained: "2026-03-18",
    feedbackSignals: 620,
    status: "low_data",
  },
  {
    id: "price-elast",
    name: "Price Elasticity",
    accuracy: 68,
    lastTrained: "2026-03-10",
    feedbackSignals: 415,
    status: "retrain",
  },
];

const STATUS_CONFIG = {
  good: {
    label: "Good",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  low_data: {
    label: "Low data",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  retrain: {
    label: "Retrain",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export default function AIFeedbackPage() {
  const [autoRetrain, setAutoRetrain] = useState(true);
  const [retrainingModel, setRetrainingModel] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, string>>({});

  const handleRetrain = (modelId: string) => {
    setRetrainingModel(modelId);
    setTimeout(() => setRetrainingModel(null), 2500);
  };

  const handleFeedback = (modelId: string, type: string) => {
    setFeedbackGiven((prev) => ({ ...prev, [modelId]: type }));
  };

  const avgAccuracy = Math.round(MODELS.reduce((s, m) => s + m.accuracy, 0) / MODELS.length);
  const totalSignals = MODELS.reduce((s, m) => s + m.feedbackSignals, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-violet-500" />
          AI Feedback & Model Health
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor model performance, collect feedback, and manage retraining
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-2xl font-bold">{MODELS.length}</p>
            <p className="text-xs text-muted-foreground">Active models</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-2xl font-bold">{avgAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Avg accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-2xl font-bold">{totalSignals.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Feedback signals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-2xl font-bold">
              {MODELS.filter((m) => m.status === "retrain").length}
            </p>
            <p className="text-xs text-muted-foreground">Need retraining</p>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Model Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Last Trained</TableHead>
                  <TableHead>Feedback Signals</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODELS.map((model) => {
                  const sc = STATUS_CONFIG[model.status];
                  return (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                model.accuracy >= 80
                                  ? "bg-emerald-500"
                                  : model.accuracy >= 70
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${model.accuracy}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono">{model.accuracy}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {model.lastTrained}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {model.feedbackSignals.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs gap-1 ${sc.badge}`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => handleRetrain(model.id)}
                          disabled={retrainingModel === model.id}
                        >
                          <RotateCcw className={`h-3 w-3 ${retrainingModel === model.id ? "animate-spin" : ""}`} />
                          {retrainingModel === model.id ? "Training..." : "Retrain"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            Feedback Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Rate the quality of recent AI outputs to improve model accuracy.
          </p>
          <div className="space-y-3">
            {MODELS.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
              >
                <div>
                  <p className="text-sm font-medium">{model.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Latest prediction batch &middot; {model.feedbackSignals} signals
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={feedbackGiven[model.id] === "useful" ? "default" : "outline"}
                    size="sm"
                    className={`h-8 text-xs gap-1 ${
                      feedbackGiven[model.id] === "useful" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                    }`}
                    onClick={() => handleFeedback(model.id, "useful")}
                  >
                    <ThumbsUp className="h-3 w-3" /> Useful
                  </Button>
                  <Button
                    variant={feedbackGiven[model.id] === "not_relevant" ? "default" : "outline"}
                    size="sm"
                    className={`h-8 text-xs gap-1 ${
                      feedbackGiven[model.id] === "not_relevant" ? "bg-red-600 hover:bg-red-700 text-white" : ""
                    }`}
                    onClick={() => handleFeedback(model.id, "not_relevant")}
                  >
                    <ThumbsDown className="h-3 w-3" /> Not relevant
                  </Button>
                  <Button
                    variant={feedbackGiven[model.id] === "correct" ? "default" : "outline"}
                    size="sm"
                    className={`h-8 text-xs gap-1 ${
                      feedbackGiven[model.id] === "correct" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
                    }`}
                    onClick={() => handleFeedback(model.id, "correct")}
                  >
                    <Pencil className="h-3 w-3" /> Correct
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Auto-Retrain & Manual Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Training Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-retrain toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
            <div>
              <p className="text-sm font-medium">Auto-retrain when accuracy drops below 75%</p>
              <p className="text-xs text-muted-foreground">
                Models will be automatically queued for retraining when their accuracy falls below threshold.
              </p>
            </div>
            <button
              onClick={() => setAutoRetrain(!autoRetrain)}
              className="flex items-center"
            >
              {autoRetrain ? (
                <ToggleRight className="h-8 w-8 text-violet-500" />
              ) : (
                <ToggleLeft className="h-8 w-8 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Manual buttons */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-1">
              <Trash2 className="h-4 w-4" /> Clear feedback cache
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <FileText className="h-4 w-4" /> View training logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
