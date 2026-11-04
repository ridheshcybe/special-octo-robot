import { InteractiveWaitLoader } from "./_components/InteractiveWaitLoader";

export default function PrepMeUpLoading() {
  return (
    <div style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <InteractiveWaitLoader
        title="Loading PrepMeUp AI Module…"
        subtitle="Test the digital logic gate or flip a rapid Semester 1 exam card while the module initializes!"
      />
    </div>
  );
}
