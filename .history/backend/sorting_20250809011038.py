# backend/sorting.py
import os, json
from datetime import datetime, timedelta

def parse_dt(x):
    if isinstance(x, datetime):
        return x
    if isinstance(x, str):
        if 'T' in x:
            return datetime.strptime(x, "%Y-%m-%dT%H:%M:%S")
        return datetime.strptime(x, "%Y-%m-%d")
    return datetime.fromtimestamp(float(x))

def sort_video_labels_by_date(data):
    items = list(data['video_labels'].items())
    items.sort(key=lambda kv: parse_dt(kv[1]['time']))
    data['video_labels'] = dict(items)
    return data

def resort_all_data(sites, animals, actions, add_labels, data, date_labels):
    videos = []
    video_labels = data['video_labels']
    start_date = parse_dt(date_labels[0])
    end_date = parse_dt(date_labels[1])
    for video, labels in video_labels.items():
        if labels.get("site") not in sites:
            continue
        ok_animals = False
        for a in animals:
            if a in labels.get("animals", []):
                ok_animals = True; break
        if not ok_animals:
            continue
        ok_actions = False
        for act in actions:
            if act in labels.get("actions", []):
                ok_actions = True; break
            if act == 'none' and len(labels.get("actions", [])) == 0:
                ok_actions = True; break
        if not ok_actions:
            continue
        ok_add = False
        for lbl in add_labels:
            if lbl in labels.get("additional_labels", []):
                ok_add = True; break
            if lbl == 'none' and len(labels.get("additional_labels", [])) == 0:
                ok_add = True; break
        if not ok_add:
            continue
        vdt = parse_dt(labels["time"])
        if not (start_date <= vdt <= end_date):
            continue
        videos.append(video)
    return {'Cam Sites': sites, 'Animals': animals, 'Actions': actions,
            "Addt'l Labels": add_labels, 'Videos': videos, 'Dates': [start_date, end_date]}

def reverse_subset(videos, video_labels):
    sites, animals, actions, add_labels = [], [], [], []
    for v in videos:
        lbl = video_labels[v]
        s = lbl.get('site')
        if s and s not in sites: sites.append(s)
        for a in lbl.get('animals', []):
            if a not in animals: animals.append(a)
        acts = lbl.get('actions', [])
        for ac in acts:
            if ac not in actions: actions.append(ac)
        adds = lbl.get('additional_labels', [])
        for ad in adds:
            if ad not in add_labels: add_labels.append(ad)
        if len(acts) == 0 and 'none' not in actions:
            actions.append('none')
        if len(adds) == 0 and 'none' not in add_labels:
            add_labels.append('none')
    return {'Cam Sites': sites, 'Animals': animals, 'Actions': actions, "Addt'l Labels": add_labels}

def load_latest_json(json_dir, default_json_path):
    files = [f for f in os.listdir(json_dir) if f.endswith('.json')]
    files.sort(key=lambda x: os.path.getctime(os.path.join(json_dir, x)), reverse=True)
    latest = os.path.join(json_dir, files[0]) if files else os.path.join(json_dir, default_json_path)
    return latest
