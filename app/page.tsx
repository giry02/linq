import type { Metadata } from "next";
import { LinqDashboard } from "./components/LinqDashboard";

export const metadata: Metadata = {
  title: "LIN-Q | 통합 관제 대시보드",
  description: "LIN-Q 장비 운영 현황과 수익 지표를 한눈에 확인하는 메인 대시보드",
};

export default function Home() {
  return <LinqDashboard />;
}
