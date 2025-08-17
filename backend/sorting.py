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
    
    # Convert to sets for O(1) lookup
    sites_set = set(sites) if sites else set()
    animals_set = set(animals) if animals else set()
    actions_set = set(actions) if actions else set()
    add_labels_set = set(add_labels) if add_labels else set()
    
    # Early exit if any required filter is empty
    if not sites or not animals or not actions or not add_labels:
        return videos
    
    for video, labels in video_labels.items():
        # Restricted check
        if restricted and labels.get("restricted", False):
            continue

        # Sites check - must be in selected sites
        if labels.get("site") not in sites_set:
            continue

        # Animals check - optimized with set
        video_animals = labels.get("animals", [])
        if 'none' in animals_set and len(video_animals) == 0:
            pass  # Match videos with no animals
        elif any(a in animals_set for a in video_animals):
            pass  # Match videos with selected animals
        else:
            continue
        
        # Actions check - optimized with set
        video_actions = labels.get("actions", [])
        if 'none' in actions_set and len(video_actions) == 0:
            pass  # Match videos with no actions
        elif any(act in actions_set for act in video_actions):
            pass  # Match videos with selected actions
        else:
            continue
        
        # Additional labels check - optimized with set
        video_add_labels = labels.get("additional_labels", [])
        if 'none' in add_labels_set and len(video_add_labels) == 0:
            pass  # Match videos with no additional labels
        elif any(lbl in add_labels_set for lbl in video_add_labels):
            pass  # Match videos with selected additional labels
        else:
            continue
        
        # Date check
        vdt = parse_dt(labels["time"])
        if not (start_date <= vdt <= end_date):
            continue
            
        videos.append(video)
        
    return videos

def reverse_subset(videos, video_labels):
    # Use sets for automatic deduplication
    sites = set()
    animals = set()
    actions = set()
    add_labels = set()
    
    for v in videos:
        lbl = video_labels[v]
        
        # Add site
        s = lbl.get('site')
        if s:
            sites.add(s)
        
        # Handle animals
        anims = lbl.get('animals', [])
        if len(anims) == 0:
            animals.add('none')
        else:
            animals.update(anims)
        
        # Handle actions
        acts = lbl.get('actions', [])
        if len(acts) == 0:
            actions.add('none')
        else:
            actions.update(acts)
        
        # Handle additional labels
        adds = lbl.get('additional_labels', [])
        if len(adds) == 0:
            add_labels.add('none')
        else:
            add_labels.update(adds)

    return {
        'sites': list(sites),
        'animals': list(animals),
        'actions': list(actions),
        'add_labels': list(add_labels)
    }