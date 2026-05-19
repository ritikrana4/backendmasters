import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { courses } from "@/lib/courses";

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Sidebar courses={courses} activeCourse="ai" />
      <div
        style={{
          paddingTop: "var(--header-height)",
          paddingLeft: "var(--content-sidebar-offset)",
          minHeight: "100vh",
          background: "#0d1117",
        }}
      >
        <main className="content-main">{children}</main>
      </div>
    </>
  );
}
