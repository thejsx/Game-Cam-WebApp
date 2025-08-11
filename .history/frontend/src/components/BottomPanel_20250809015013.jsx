import { useState, useEffect, useMemo } from "react";

export default function BottomPanel({ data, onFilterChange, onOpenPlayer }) {
  const [sites, setSites] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [actions, setActions] = useState([]);
  const [adds, setAdds] = useState([]);
  const [start, setStart] = useState("2020-01-01");
  const [end, setEnd] = useState(new Date().toISOString().slice(0,10));
  const [videos, setVideos] = useState([]);

  // Derive option catalogs from either full JSON (with sorted_videos) or filtered snapshot.
  const catalogs = useMemo(() => {
    if (!data) return { siteOpts: [], animalOpts: [], actionOpts: [], addOpts: [], videoList: [] };

    const siteOpts =
      data.sites ? Object.values(data.sites).map(s => s.site) :
      (data.reverse_subset && data.reverse_subset['Cam Sites']) || [];

    const sv = data.sorted_videos || {};
    const svAnimals = sv.animal_videos ? Object.keys(sv.animal_videos) : [];
    const svActions = sv.actions ? Object.keys(sv.actions) : [];
    const svAdds = sv.additional_labels ? Object.keys(sv.additional_labels) : [];

    const animalOpts = svAnimals.length ? svAnimals : ((data.reverse_subset && data.reverse_subset['Animals']) || []);
    const actionOpts = svActions.length ? svActions : ((data.reverse_subset && data.reverse_subset['Actions']) || []);
    const addOpts    = svAdds.length  ? svAdds  : ((data.reverse_subset && data.reverse_subset["Addt'l Labels"]) || []);

    const videoList =
      (data.title_dictionary && data.title_dictionary.Videos) ||
      Object.keys(data.video_labels || {});

    return { siteOpts, animalOpts, actionOpts, addOpts, videoList };
  }, [data]);

  // Initialize / refresh lists when data changes
  useEffect(() => {
    if (!data) return;
    setSites(prev => prev.length ? prev : catalogs.siteOpts);
    const withNone = catalogs.animalOpts.includes('none') ? catalogs.animalOpts : ['none', ...catalogs.animalOpts];
    setAnimals(prev => prev.length ? prev : withNone);
    setActions(prev => prev.length ? prev : catalogs.actionOpts);
    setAdds(prev => prev.length ? prev : catalogs.addOpts);
    setVideos(catalogs.videoList);
  }, [data, catalogs]);

  // Push filters up whenever user changes any selection or date range
  useEffect(() => {
    if (!onFilterChange) return;
    // Only fire when we actually have options (prevents early empty queries)
    if (!sites.length && !animals.length && !actions.length && !adds.length) return;
    onFilterChange({
      sites,
      animals,
      actions,
      add_labels: adds,
      start,
      end
    });
  }, [sites, animals, actions, adds, start, end, onFilterChange]);

  const ItemList = ({ title, vals, setVals, all }) => (
    <div style={{ minWidth: title === "Cam Sites" ? 200 : 120 }}>
      <div><b>{title}</b></div>
      <div style={{ maxHeight: 180, overflowY: "auto", border: "1px solid #ddd", padding: 4 }}>
        {all.map(v => {
          const checked = vals.includes(v);
          return (
            <div key={v} onClick={() => {
              setVals(x => checked ? x.filter(y => y !== v) : [...x, v]);
            }} style={{ cursor: "pointer" }}>
              <input readOnly type="checkbox" checked={checked} /> {v}
            </div>
          );
        })}
      </div>
      <button onClick={() => setVals(all)}>Select All</button>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 10, padding: 8, borderTop: "1px solid #ccc" }}>
      <ItemList title="Cam Sites"    vals={sites}   setVals={setSites}   all={catalogs.siteOpts} />
      <ItemList title="Animals"      vals={animals} setVals={setAnimals} all={catalogs.animalOpts.includes('none') ? catalogs.animalOpts : ['none', ...catalogs.animalOpts]} />
      <ItemList title="Actions"      vals={actions} setVals={setActions} all={catalogs.actionOpts} />
      <ItemList title="Addt'l Labels" vals={adds}   setVals={setAdds}    all={catalogs.addOpts} />
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
