// Performance test script
import { resortAllData, reverseSubset } from './frontend/src/filterHelpers.js';

// Generate test data
function generateTestData(numVideos) {
    const videoLabels = {};
    const sites = ['Site1', 'Site2', 'Site3', 'Site4', 'Site5'];
    const animals = ['deer', 'bear', 'elk', 'none'];
    const actions = ['walking', 'running', 'eating', 'none'];
    const addLabels = ['night', 'day', 'rain', 'none'];
    
    for (let i = 0; i < numVideos; i++) {
        const videoId = `video_${i}`;
        videoLabels[videoId] = {
            site: sites[Math.floor(Math.random() * sites.length)],
            animals: Math.random() > 0.3 ? [animals[Math.floor(Math.random() * (animals.length - 1))]] : [],
            actions: Math.random() > 0.3 ? [actions[Math.floor(Math.random() * (actions.length - 1))]] : [],
            additional_labels: Math.random() > 0.3 ? [addLabels[Math.floor(Math.random() * (addLabels.length - 1))]] : [],
            time: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
            restricted: Math.random() > 0.9
        };
    }
    
    return videoLabels;
}

// Test filtering performance
function testFilteringPerformance(numVideos) {
    console.log(`\nTesting with ${numVideos} videos...`);
    const videoLabels = generateTestData(numVideos);
    
    const testCases = [
        {
            name: 'All filters selected',
            sites: ['Site1', 'Site2', 'Site3', 'Site4', 'Site5'],
            animals: ['deer', 'bear', 'elk', 'none'],
            actions: ['walking', 'running', 'eating', 'none'],
            addLabels: ['night', 'day', 'rain', 'none']
        },
        {
            name: 'Single site, all animals',
            sites: ['Site1'],
            animals: ['deer', 'bear', 'elk', 'none'],
            actions: ['walking', 'running', 'eating', 'none'],
            addLabels: ['night', 'day', 'rain', 'none']
        },
        {
            name: 'Multiple sites, single animal',
            sites: ['Site1', 'Site2', 'Site3'],
            animals: ['deer'],
            actions: ['walking', 'running', 'eating', 'none'],
            addLabels: ['night', 'day', 'rain', 'none']
        }
    ];
    
    testCases.forEach(testCase => {
        const start = performance.now();
        
        const filtered = resortAllData(
            videoLabels,
            testCase.sites,
            testCase.animals,
            testCase.actions,
            testCase.addLabels,
            ['2023-01-01', '2023-12-31'],
            false
        );
        
        const reverseSubsetResult = reverseSubset(filtered, videoLabels);
        
        const end = performance.now();
        const duration = (end - start).toFixed(2);
        
        console.log(`  ${testCase.name}: ${duration}ms (${filtered.length} videos matched)`);
    });
}

// Run tests
console.log('Performance Test Results');
console.log('========================');
testFilteringPerformance(100);
testFilteringPerformance(1000);
testFilteringPerformance(5000);
testFilteringPerformance(10000);