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

def resort_all_data(data, sites, animals, actions, add_labels, date_labels, restricted):
    videos = []
    video_labels = data['video_labels']
    start_date = parse_dt(date_labels[0])
    end_date = parse_dt(date_labels[1])
    for video, labels in video_labels.items():
        # Restricted check
        if restricted and labels.get("restricted", False):
            continue

        # Sites check - empty filter means no videos should match
        if labels.get("site") not in sites:
            continue

        # Animals check - empty filter means no videos should match
        if len(animals) == 0:
            continue
        ok_animals = False
        video_animals = labels.get("animals", [])
        for a in animals:
            if a in video_animals:
                ok_animals = True; break
            # Handle 'none' case - match videos with empty animals list
            if a == 'none' and len(video_animals) == 0:
                ok_animals = True; break
        if not ok_animals:
            continue
        
        # Actions check - empty filter means no videos should match
        if len(actions) == 0:
            continue
        ok_actions = False
        for act in actions:
            if act in labels.get("actions", []):
                ok_actions = True; break
            if act == 'none' and len(labels.get("actions", [])) == 0:
                ok_actions = True; break
        if not ok_actions:
            continue
        
        # Additional labels check - empty filter means no videos should match
        if len(add_labels) == 0:
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
    return videos

def reverse_subset(videos, video_labels):
    sites, animals, actions, add_labels = [], [], [], []
    for v in videos:
        lbl = video_labels[v]
        s = lbl.get('site')
        if s and s not in sites: sites.append(s)
        
        # Handle animals
        anims = lbl.get('animals', [])
        for a in anims:
            if a not in animals: animals.append(a)
        if len(anims) == 0 and 'none' not in animals:
            animals.append('none')
        
        # Handle actions
        acts = lbl.get('actions', [])
        for ac in acts:
            if ac not in actions: actions.append(ac)
        if len(acts) == 0 and 'none' not in actions:
            actions.append('none')
        
        # Handle additional labels
        adds = lbl.get('additional_labels', [])
        for ad in adds:
            if ad not in add_labels: add_labels.append(ad)
        if len(adds) == 0 and 'none' not in add_labels:
            add_labels.append('none')
    
    return {'Cam Sites': sites, 'Animals': animals, 'Actions': actions, "Addt'l Labels": add_labels}

