import { useState } from "react";
import {
  RENTAL_AGREEMENT_DOCS,
  RENTAL_AGREEMENT_SUMMARY,
  type RentalAgreementDoc
} from "@rental-preview/shared";
import { cn } from "../lib/utils";

type OrderAgreementPanelProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  variant?: "section" | "compact" | "sheet";
  showSummary?: boolean;
  showCheckbox?: boolean;
};

const AgreementDocModal = ({
  doc,
  onClose
}: {
  doc: RentalAgreementDoc;
  onClose: () => void;
}) => (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agreement-doc-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-phone flex-col rounded-t-2xl bg-card shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 id="agreement-doc-title" className="text-base font-bold">
          {doc.title}
        </h3>
        <button
          type="button"
          className="rounded-lg px-3 py-1 text-sm text-primary"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
      <div className="overflow-y-auto px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        {doc.sections.map((s) => (
          <div key={s.heading} className="mb-4">
            <p className="font-medium text-foreground">{s.heading}</p>
            <p className="mt-1">{s.body}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-border p-4 safe-bottom">
        <button
          type="button"
          className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground"
          onClick={onClose}
        >
          我已阅读
        </button>
      </div>
    </div>
  </div>
);

export const OrderAgreementPanel = ({
  checked,
  onCheckedChange,
  variant = "section",
  showSummary = true,
  showCheckbox = true
}: OrderAgreementPanelProps) => {
  const [openDoc, setOpenDoc] = useState<RentalAgreementDoc | null>(null);

  const checkboxRow = (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-2.5",
        variant === "compact" && "text-xs",
        variant === "sheet" && "text-sm"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
        aria-label="同意订单前必读协议"
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <span className="leading-snug text-muted-foreground">
        我已阅读并同意
        {RENTAL_AGREEMENT_DOCS.map((doc, i) => (
          <span key={doc.id}>
            {i > 0 && (i === RENTAL_AGREEMENT_DOCS.length - 1 ? "及" : "、")}
            <button
              type="button"
              className="text-primary underline-offset-2 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                setOpenDoc(doc);
              }}
            >
              《{doc.shortLabel}》
            </button>
          </span>
        ))}
      </span>
    </label>
  );

  if (variant === "compact") {
    return (
      <>
        <div
          className={cn(
            "rounded-lg border px-3 py-2",
            checked ? "border-border bg-muted/50" : "border-warning/30 bg-warning/10"
          )}
        >
          {checkboxRow}
        </div>
        {openDoc && <AgreementDocModal doc={openDoc} onClose={() => setOpenDoc(null)} />}
      </>
    );
  }

  if (variant === "sheet") {
    return (
      <>
        <div className="space-y-3">
          <p className="text-sm font-bold text-foreground">订单前必读</p>
          {showSummary && (
            <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
              {RENTAL_AGREEMENT_SUMMARY.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          {checkboxRow}
        </div>
        {openDoc && <AgreementDocModal doc={openDoc} onClose={() => setOpenDoc(null)} />}
      </>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-bold text-foreground">订单前必读</p>
        <p className="mt-1 text-xs text-muted-foreground">
          提交订单前请确认以下要点，完整条款可点击查看
        </p>
        {showSummary && (
          <ul className="mt-3 space-y-2">
            {RENTAL_AGREEMENT_SUMMARY.map((line) => (
              <li
                key={line}
                className="flex gap-2 text-xs text-muted-foreground before:shrink-0 before:content-['•']"
              >
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {RENTAL_AGREEMENT_DOCS.map((doc) => (
            <button
              key={doc.id}
              type="button"
              className="rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] text-primary"
              onClick={() => setOpenDoc(doc)}
            >
              查看{doc.shortLabel}
            </button>
          ))}
        </div>
        {showCheckbox && <div className="mt-4 border-t border-border pt-3">{checkboxRow}</div>}
      </div>
      {openDoc && <AgreementDocModal doc={openDoc} onClose={() => setOpenDoc(null)} />}
    </>
  );
};
