// This component is a placeholder for embedding your existing app frontend.
// Replace the iframe src or embed logic as needed.

export default function MainAppEmbed() {
  return (
    <div className="w-full h-[80vh] flex items-center justify-center bg-white rounded shadow">
      <iframe
        src="/app/index.html"
        title="Investment Tools Hub App"
        className="w-full h-full border-0 rounded"
        allowFullScreen
      />
    </div>
  );
}
