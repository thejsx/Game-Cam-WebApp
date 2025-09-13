// Optimized filtering logic with better performance

export function parseDt(x) {
    if (x instanceof Date) return x;
    if (typeof x === 'string') {
        if (x.includes('T')) return new Date(x);
        return new Date(x + 'T00:00:00');
    }
    return new Date(x * 1000);
}

export function sortVideoLabelsByDate(videoLabels) {
    const items = Object.entries(videoLabels);
    items.sort((a, b) => parseDt(a[1].time) - parseDt(b[1].time));
    return Object.fromEntries(items);
}

// Optimized with Set lookups instead of array.includes()
export function resortAllData(videoLabels, sites, animals, actions, addLabels, dateLabels, restricted) {
    const videos = [];
    const startDate = parseDt(dateLabels[0]);
    const endDate = parseDt(dateLabels[1]);
    
    // Convert arrays to Sets for O(1) lookup instead of O(n)
    const sitesSet = new Set(sites);
    const animalsSet = new Set(animals);
    const actionsSet = new Set(actions);
    const addLabelsSet = new Set(addLabels);
    
    // Pre-check for early exits
    if (sites.length === 0 || animals.length === 0 || actions.length === 0 || addLabels.length === 0) {
        return videos;
    }
    
    for (const [video, labels] of Object.entries(videoLabels)) {
        // Restricted check
        if (restricted && labels.restricted) continue;
        
        // Sites check
        if (!sitesSet.has(labels.site)) continue;
        
        // Animals check - optimized with Set (has explict none label)
        const videoAnimals = labels.animals || [];
        let okAnimals = false;
        
        for (const a of videoAnimals) {
            if (animalsSet.has(a)) {
                okAnimals = true;
                break;
            }
        }
        if (!okAnimals) continue;
        
        // Actions check - optimized with Set (no explicit none label)
        const videoActions = labels.actions || [];
        let okActions = false;
        
        if (actionsSet.has('none') && videoActions.length === 0) {
            okActions = true;
        } else {
            for (const act of videoActions) {
                if (actionsSet.has(act)) {
                    okActions = true;
                    break;
                }
            }
        }
        if (!okActions) continue;
        
        // Additional labels check - optimized with Set (no explicit none label)
        const videoAddLabels = labels.additional_labels || [];
        let okAdd = false;
        
        if (addLabelsSet.has('none') && videoAddLabels.length === 0) {
            okAdd = true;
        } else {
            for (const lbl of videoAddLabels) {
                if (addLabelsSet.has(lbl)) {
                    okAdd = true;
                    break;
                }
            }
        }
        if (!okAdd) continue;
        
        // Date check
        const vdt = parseDt(labels.time);
        if (!(vdt >= startDate && vdt <= endDate)) continue;
        
        videos.push(video);
    }
    
    return videos;
}

// Optimized reverse subset with Set for deduplication
export function reverseSubset(videos, videoLabels) {
    const sites = new Set();
    const animals = new Set();
    const actions = new Set();
    const addLabels = new Set();
    
    for (const v of videos) {
        const lbl = videoLabels[v];
        
        if (lbl.site) sites.add(lbl.site);
        
        // Handle animals (has explict none label)
        const anims = lbl.animals || [];
        anims.forEach(a => animals.add(a));

        // Handle actions (no explicit none label)
        const acts = lbl.actions || [];
        if (acts.length === 0) {
            actions.add('none');
        } else {
            acts.forEach(ac => actions.add(ac));
        }
        
        // Handle additional labels (no explicit none label)
        const adds = lbl.additional_labels || [];
        if (adds.length === 0) {
            addLabels.add('none');
        } else {
            adds.forEach(ad => addLabels.add(ad));
        }
    }
    
    return {
        sites: Array.from(sites),
        animals: Array.from(animals),
        actions: Array.from(actions),
        add_labels: Array.from(addLabels)
    };
}