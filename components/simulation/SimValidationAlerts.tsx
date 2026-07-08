"use client";

import { type ValidationSummary, type RouteValidation } from "@/lib/simulationValidation";
import { ROUTE_META } from "@/lib/simulationEngine";
import { AlertTriangle, XCircle, Info } from "lucide-react";

interface Props {
  summary: ValidationSummary;
}

export function SimValidationAlerts({ summary }: Props) {
  if (summary.issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-500">
        <span className="text-4xl mb-3">✅</span>
        <p className="font-bold text-sm">แผนไม่มีปัญหา</p>
        <p className="text-xs mt-1">จำนวนคนขับและความถี่รอบรถสมดุลดี</p>
      </div>
    );
  }

  const errors = summary.issues.filter((i) => i.level === "error");
  const warnings = summary.issues.filter((i) => i.level === "warning");

  return (
    <div className="flex flex-col gap-3">
      {errors.length > 0 && (
        <>
          <div className="flex items-center gap-2 mt-1 mb-1">
            <XCircle size={16} className="text-red-500" />
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              ข้อผิดพลาดร้ายแรง ({errors.length}) — แผนเป็นไปไม่ได้
            </span>
          </div>
          {errors.map((issue, idx) => (
            <AlertCard key={`err-${idx}`} issue={issue} />
          ))}
        </>
      )}

      {warnings.length > 0 && (
        <>
          <div className="flex items-center gap-2 mt-4 mb-1">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              ข้อควรระวัง ({warnings.length}) — อาจเกิดปัญหาในทางปฏิบัติ
            </span>
          </div>
          {warnings.map((issue, idx) => (
            <AlertCard key={`warn-${idx}`} issue={issue} />
          ))}
        </>
      )}
    </div>
  );
}

function AlertCard({ issue }: { issue: RouteValidation }) {
  const meta = ROUTE_META[issue.route];
  const isError = issue.level === "error";

  return (
    <div
      className="flex gap-4 p-4 rounded-xl border"
      style={{
        background: isError ? "#fef2f2" : "#fffbeb",
        borderColor: isError ? "#fca5a5" : "#fcd34d",
      }}
    >
      {/* Route Badge */}
      <div className="flex-shrink-0 pt-0.5">
        <div
          className="flex flex-col items-center justify-center w-10 h-10 rounded-lg text-[0.55rem] font-black"
          style={{
            background: `${meta.color}15`,
            color: meta.color,
            border: `1px solid ${meta.color}30`,
          }}
        >
          <span className="text-sm leading-none mb-0.5">
            {issue.route === "green" ? "🟢" : issue.route === "blue" ? "🔵" : "🔴"}
          </span>
          <span className="leading-none">{issue.route.toUpperCase()}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold mb-1.5" style={{ color: isError ? "#dc2626" : "#d97706" }}>
          {issue.title}
        </h4>
        <p className="text-xs text-slate-700 leading-snug mb-2.5">{issue.detail}</p>
        {issue.suggestion && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 shadow-sm">
            <Info size={12} className="text-blue-500" />
            <span className="text-[0.6rem] text-slate-700 font-semibold">{issue.suggestion}</span>
          </div>
        )}
      </div>
    </div>
  );
}
