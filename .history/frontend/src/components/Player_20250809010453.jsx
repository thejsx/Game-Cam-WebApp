// frontend/src/components/Player.jsx
import { useEffect, useState } from "react";
import { API, fetchLabels } from "../api";

export default function Player() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [labels, setLabels] = useState(null);

  useEffect(() => {
    const q = JSON.parse(sessionStorage.getItem("queue") || "[]");
    setQueue(q); setCurrent(q[0] || null);
    fetchLabels().then(setLabels);
  }, []);

  if (!current) return <div style={{ padding: 20 }}>No video selected.</div>;
  const info = labels && labels.video_labels && labels.video_labels[current];
  const desc = info ? `${info.time.split('T')[0]} | ${info.site} | ${info.animals.join(', ')} | ${info.actions.join(', ')} | ${info.additional_labels.join(', ')}` : '';

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, padding: 10 }}>
        <video style={{ width: "100%", height: "70%" }} controls
          src={`${API}/api/video?path=${encodeURIComponent(current)}`} />
        <div style={{ marginTop: 10 }}>
          <div><b>Description</b></div>
          <div>{desc}</div>
        </div>
      </div>
      <div style={{ width: 340, borderLeft: "1px solid #ddd", padding: 10, overflowY: "auto" }}>
        <b>Queue</b>
        {queue.map(v => (
          <div key={v} onClick={() => setCurrent(v)} title={v} style={{ cursor: "pointer", marginTop: 8 }}>
            {labels && labels.video_labels && labels.video_labels[v]
              ? labels.video_labels[v].time.split('T')[0] : 'Video'}
          </div>
        ))}
      </div>
    </div>
  );
}
