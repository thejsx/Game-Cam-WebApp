# backend/app.py
import os, json, mimetypes
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sorting import resort_all_data, reverse_subset, sort_video_labels_by_date, load_latest_json

JSON_DIR = r"C:\Users\jrsch\Documents\Visual Studio Code\Deer Score Prediction\yolov5\GameCamFiles\GameCamClassifierJSONs"
DEFAULT_JSON_BASENAME = "GameCamClassifiers.json"
APP_PORT = 10000

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def read_labels():
    path = load_latest_json(JSON_DIR, DEFAULT_JSON_BASENAME)
    with open(path, 'r') as f:
        data = json.load(f)
    return sort_video_labels_by_date(data)

def as_list(q):
    if not q: return []
    return [x for x in q.split(',') if x]

@app.get("/api/labels")
def get_labels(request: Request):
    data = read_labels()
    qp = request.query_params
    has_filters = any(k in qp for k in ["sites","animals","actions","add_labels","start","end","restricted"])
    if not has_filters:
        return data
    sites = as_list(qp.get("sites")) or [x['site'] for _, x in data['sites'].items()]
    animals = as_list(qp.get("animals")) or list(data['sorted_videos']['animal_videos'].keys())
    if 'none' in animals:
        pass
    else:
        if 'none' in data['sorted_videos']['animal_videos']:
            animals.insert(0, 'none')
    actions = as_list(qp.get("actions")) or list(data['sorted_videos']['actions'].keys())
    add_labels = as_list(qp.get("add_labels")) or list(data['sorted_videos']['additional_labels'].keys())
    start = qp.get("start") or "2020-01-01"
    end = qp.get("end") or datetime.now().strftime("%Y-%m-%d")
    restricted = qp.get("restricted")
    title_dict = resort_all_data(sites, animals, actions, add_labels, data, [start, end])
    videos = title_dict['Videos']
    if restricted and restricted.lower() in ["1","true","yes"]:
        videos = [v for v in videos if not data['video_labels'][v].get('restricted')]
    subset_labels = {v: data['video_labels'][v] for v in videos}
    rsub = reverse_subset(videos, data['video_labels'])
    return {
        "sites": data["sites"],
        "title_dictionary": dict(title_dict, Videos=videos),
        "reverse_subset": rsub,
        "video_labels": subset_labels
    }

@app.get("/api/video")
def get_video(request: Request, path: str):
    data = read_labels()
    if path not in data['video_labels']:
        raise HTTPException(status_code=404, detail="Video not indexed")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    file_size = os.path.getsize(path)
    range_header = request.headers.get("range")
    start = 0
    end = file_size - 1
    if range_header and range_header.startswith("bytes="):
        s = range_header.split("=")[1]
        s = s.split("-")
        if s[0]: start = int(s[0])
        if len(s) > 1 and s[1]: end = int(s[1])
    if start > end or start < 0 or end >= file_size:
        raise HTTPException(status_code=416, detail="Range Not Satisfiable")
    def iterfile(fp, start, end, chunk=1024*1024):
        with open(fp, "rb") as f:
            f.seek(start)
            remaining = end - start + 1
            while remaining > 0:
                data = f.read(min(chunk, remaining))
                if not data: break
                remaining -= len(data)
                yield data
    media_type = mimetypes.guess_type(path)[0] or "application/octet-stream"
    headers = {
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(end - start + 1),
    }
    return StreamingResponse(iterfile(path, start, end), status_code=206, media_type=media_type, headers=headers)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=APP_PORT, reload=True)
