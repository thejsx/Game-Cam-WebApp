from sorting import sort_video_labels_by_date
import os
import json

JSON_DIR = r"C:\Users\jrsch\Documents\Visual Studio Code\Deer Score Prediction\yolov5\GameCamFiles\GameCamClassifierJSONs"
DEFAULT_JSON_BASENAME = "GameCamClassifiers.json"

def read_labels():
    path = os.path.join(JSON_DIR, DEFAULT_JSON_BASENAME)
    with open(path, 'r') as f:
        data = json.load(f)
    return sort_video_labels_by_date(data)

date_sorted_data = read_labels()
print(json.dumps(date_sorted_data['video_labels'], indent=2))