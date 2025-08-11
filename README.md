Game Cam WebApp — User Guide
What this app does
Game Cam WebApp lets you browse, filter, and watch wildlife camera videos quickly and visually. The home screen is a map-first view of your camera sites. A bottom strip contains filter lists (Cam Sites, Animals, Actions, Additional Labels, Date Range) plus a Videos panel. Your choices in the map and filters instantly narrow the video list. Double‑click a video to open a YouTube‑style player tab with the main player on the left and a queue on the right.

Everything runs locally against your existing labels file and video files.

The interface at a glance
Map (top, dominant area): Circle markers for each camera site. Hover to see the site name; click to select/deselect. A Recenter button fits the map to your current selection.

Bottom strip (left → right):
Cam Sites · Animals · Actions · Addt’l Labels · Date Range · Videos (N)
Each list is checkable; the Videos panel shows the count and current results.

Player tab: Opens in a new browser tab when you double‑click a video. The main video is on the left; a queue of selected videos appears on the right. A short description summarizes labels (date, site, animals, actions, additional labels).

Key concepts
Sites: Named camera locations with GPS coordinates that appear as pins on the map.

Animals / Actions / Additional labels: Tags attached to each video.

Animals often include a special none tag for videos where no animal is detected but you still want them included.

Actions and Additional labels treat none as “no actions/labels present” when selected.

Date range: Limits results to videos whose timestamp falls within your chosen start and end dates.

Restricted mode (optional): When enabled, hides videos marked as restricted in your labels.

Using the map
Select sites by clicking markers. Selected sites appear in one color; non‑selected in another.

Recenter anytime. The Recenter control zooms the map to show all selected sites. If none are selected, the map returns to the default view.

Tip: You can use the map to quickly focus on a region, then refine with filters below.

Filtering videos
The bottom strip mirrors the desktop tool and drives the video results.

Cam Sites

Check/uncheck sites to include/exclude them.

The map and this list are connected: clicking a marker toggles that site in the list.

Animals

Selecting multiple animals is treated as “OR”—videos that contain any of your selected animals will appear.

Selecting none includes videos with no animal labels.

Actions

Behaves like animals (OR behavior).

Selecting none includes videos that have no actions.

Addt’l Labels

Same pattern: select one or more; none includes videos that have no additional labels.

Date Range

Choose a start and end date (inclusive).

Use this to narrow down to seasons or specific trips.

As you change any of these, the Videos (N) panel updates automatically. Items not available under the current selection can appear grayed to indicate they won’t produce results unless you adjust other filters.

Browsing and opening videos
Videos (N):

Shows the number of videos found and lists them in date order.

Double‑click a video to open the Player in a new browser tab.

Hovering an item may show more detail (e.g., full file path as a tooltip).

The panel is designed for fast scanning—if the list is long, use the filters to narrow it down.

The Player tab
The Player tab is modeled after YouTube’s layout for familiarity:

Main area (left):

Embedded video with standard controls (play/pause, timeline scrubbing, volume, fullscreen).

Description below the video shows a concise summary, for example:

yaml
Copy
2024-11-05 | Cabin Creek | elk | grazing | dusk
(Date | Site | Animals | Actions | Additional labels)

Queue (right):

Shows the set of videos you chose to play together.

Click any item to switch the main player to that video.

Designed for quick comparisons across a short set of clips.

Tips for smooth playback:

You can scrub the timeline; the player supports fast seeking.

If a video won’t play, it’s usually because the file isn’t present where the labels expect it. See Troubleshooting below.

Restricted mode (if enabled)
When Restricted Mode is turned on, videos marked as restricted in your labels are hidden from the results.

This is useful for removing private or sensitive footage from routine browsing.

If you don’t see a clip you expect, toggle restricted mode off to confirm whether the video is marked as restricted.

Practical examples
“Only elk at Site A last fall”

Click Site A on the map (or select it in Cam Sites).

In Animals, select elk.

Set Date Range to Sep–Nov of last year.

Open the most interesting clips to the Player tab.

“No-animal clips for camera diagnostics”

Select all relevant sites.

In Animals, choose none.

Optional: In Actions and Additional Labels, also choose none to find truly empty detections.

“Behavior study: feeding vs. traveling”

Choose the species of interest in Animals.

In Actions, select feeding and/or traveling.

Narrow the Date Range to the study period.

Review in the Player tab and use the description to verify tags.

Tips for faster browsing
Start broad, then refine. Begin with the region on the map, then filter by animals/actions.

Use Date Range strategically. Cutting to a season or trip dramatically reduces noise.

Watch the counts. The Videos (N) total tells you if you’ve over‑filtered (N drops to 0) or found a rich vein.

Recenter often. It keeps your spatial context as you toggle sites.