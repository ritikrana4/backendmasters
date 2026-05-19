import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { courses } from "@/lib/courses";

export default function PythonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Sidebar courses={courses} activeCourse="python" />
      <div
        style={{
          paddingTop: "var(--header-height)",
          paddingLeft: "var(--sidebar-width)",
          minHeight: "100vh",
          background: "#0d1117",
        }}
      >
        <main
          style={{
            padding: "40px 48px",
            maxWidth: 1000,
          }}
        >
          {children}
        </main>
      </div>
    </>
  );
}
