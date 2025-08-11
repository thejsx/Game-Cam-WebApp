// frontend/src/components/BottomPanel.jsx
import { useState, useEffect } from "react";

export default function BottomPanel({ data, onFilterChange, onOpenPlayer }) {
  const [sites, setSites] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [actions, setActions] = useState([]);
  const [adds, setAdds] = useState([]);
  const [start, setStart] = useState("2020-01-01");
  const [end, setEnd] = useState(new Date().toISOString().slice(0,10));
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (!data) return;
    const allSites = Object.values(data.sites).map(s => s.site);
    const allAnimals = Object.keys(data.sorted_videos.animal_videos || {});
    const allActions = Object.keys(data.sorted_videos.actions || {});
    const allAdds = Object.keys(data.sorted_videos.additional_labels || {});
    setSites(allSites);
    setAnimals(allAnimals.includes('none') ? allAnimals : ['none', ...allAnimals]);
    setActions(allActions);
    setAdds(allAdds);
    setVideos(Object.keys(data.video_labels || {}));
  }, [data]);

  useEffect(() => {
    onFilterChange && onFilterChange({ sites, animals, actions, add_labels: adds, start, end });
  }, [sites, animals, actions, adds, start, end]);

  const ItemList = ({ title, vals, setVals }) => (
    <div style={{ minWidth: title === "Cam Sites" ? 200 : 120 }}>
      <div><b>{title}</b></div>
      <div style={{ maxHeight: 180, overflowY: "auto", border: "1px solid #ddd", padding: 4 }}>
        {vals.map(v => (
          <div key={v} onClick={() => {
            setVals(x => x.includes(v) ? x.filter(y => y !== v) : [...x, v]);
          }} style={{ cursor: "pointer" }}>
            <input readOnly type="checkbox" checked={vals.includes(v)} /> {v}
          </div>
        ))}
      </div>
      <button onClick={() => setVals(vals)}>Select All</button>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 10, padding: 8, borderTop: "1px solid #ccc" }}>
      <ItemList title="Cam Sites" vals={sites} setVals={setSites} />
      <ItemList title="Animals" vals={animals} setVals={setAnimals} />
      <ItemList title="Actions" vals={actions} setVals={setActions} />
      <ItemList title="Addt'l Labels" vals={adds} setVals={setAdds} />
      <div style={{ minWidth: 150 }}>
        <b>Date Range</b>
        <div>Start:<input value={start} onChange={e=>setStart(e.target.value)} type="date" /></div>
        <div>End:<input value={end} onChange={e=>setEnd(e.target.value)} type="date" /></div>
      </div>
      <div style={{ flex: 1, minWidth: 240 }}>
        <b>Videos ({videos.length})</b>
        <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid #ddd", padding: 4 }}>
          {videos.map((v,i) => (
            <div key={v} onDoubleClick={() => onOpenPlayer([v])} title={v} style={{ cursor: "pointer" }}>
              Video {i+1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
