import { Link, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { api, type IncidentDetail } from "@rental-preview/shared";
import { IncidentDetailPanel } from "../components/shared/IncidentDetailPanel";

export function IncidentDetailPage() {
  const { incidentId } = useParams();
  const [detail, setDetail] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!incidentId) return;
    setLoading(true);
    const res = await api.get<IncidentDetail>(`/api/v1/admin/incidents/${incidentId}`);
    setDetail(res.ok ? res.data : null);
    setLoading(false);
  }, [incidentId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!incidentId) {
    return <p className="text-sm text-muted-foreground">缺少事故 ID</p>;
  }

  return (
    <div className="space-y-4">
      <Link to="/incidents" className="text-sm text-primary hover:underline">
        ← 事故处理列表
      </Link>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">事故详情</h2>
        <p className="text-sm text-muted-foreground">
          FR-ORD-009 · GET /api/v1/admin/incidents/:id
        </p>
      </div>
      {loading && <p className="text-sm text-muted-foreground">加载中…</p>}
      {!loading && !detail && (
        <p className="text-sm text-muted-foreground">事故记录不存在</p>
      )}
      {detail && <IncidentDetailPanel detail={detail} onRefresh={() => void load()} />}
    </div>
  );
}
