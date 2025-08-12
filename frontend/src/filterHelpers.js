// 1:1 conversion of Python filtering logic to JavaScript

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

export function resortAllData(videoLabels, sites, animals, actions, addLabels, dateLabels, restricted) {
    const videos = [];
    const startDate = parseDt(dateLabels[0]);
    const endDate = parseDt(dateLabels[1]);
    
    for (const [video, labels] of Object.entries(videoLabels)) {
        // Restricted check
        if (restricted && labels.restricted) continue;
        
        // Sites check - empty filter means no videos should match
        if (!sites.includes(labels.site)) continue;
        
        // Animals check - empty filter means no videos should match
        if (animals.length === 0) continue;
        let okAnimals = false;
        const videoAnimals = labels.animals || [];
        for (const a of animals) {
            if (videoAnimals.includes(a)) {
                okAnimals = true;
                break;
            }
            // Handle 'none' case - match videos with empty animals list
            if (a === 'none' && videoAnimals.length === 0) {
                okAnimals = true;
                break;
            }
        }
        if (!okAnimals) continue;
        
        // Actions check - empty filter means no videos should match
        if (actions.length === 0) continue;
        let okActions = false;
        const videoActions = labels.actions || [];
        for (const act of actions) {
            if (videoActions.includes(act)) {
                okActions = true;
                break;
            }
            if (act === 'none' && videoActions.length === 0) {
                okActions = true;
                break;
            }
        }
        if (!okActions) continue;
        
        // Additional labels check - empty filter means no videos should match
        if (addLabels.length === 0) continue;
        let okAdd = false;
        const videoAddLabels = labels.additional_labels || [];
        for (const lbl of addLabels) {
            if (videoAddLabels.includes(lbl)) {
                okAdd = true;
                break;
            }
            if (lbl === 'none' && videoAddLabels.length === 0) {
                okAdd = true;
                break;
            }
        }
        if (!okAdd) continue;
        
        const vdt = parseDt(labels.time);
        if (!(vdt >= startDate && vdt <= endDate)) continue;
        
        videos.push(video);
    }
    
    return videos;
}

export function reverseSubset(videos, videoLabels) {
    const sites = [];
    const animals = [];
    const actions = [];
    const addLabels = [];
    
    for (const v of videos) {
        const lbl = videoLabels[v];
        
        const s = lbl.site;
        if (s && !sites.includes(s)) sites.push(s);
        
        // Handle animals
        const anims = lbl.animals || [];
        for (const a of anims) {
            if (!animals.includes(a)) animals.push(a);
        }
        if (anims.length === 0 && !animals.includes('none')) {
            animals.push('none');
        }
        
        // Handle actions
        const acts = lbl.actions || [];
        for (const ac of acts) {
            if (!actions.includes(ac)) actions.push(ac);
        }
        if (acts.length === 0 && !actions.includes('none')) {
            actions.push('none');
        }
        
        // Handle additional labels
        const adds = lbl.additional_labels || [];
        for (const ad of adds) {
            if (!addLabels.includes(ad)) addLabels.push(ad);
        }
        if (adds.length === 0 && !addLabels.includes('none')) {
            addLabels.push('none');
        }
    }
    
    return {
        sites,
        animals,
        actions,
        add_labels: addLabels
    };
}