// // Fetch progress report
// async function fetchProgressReport() {
//     try {
//         const response = await fetch('/group8/get-progress-report/', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
//         const data = await response.json(); // e.g. { total_words_learned, progress_by_category, progress_by_level }
//         if (response.ok) {
//             return data;
//         } else {
//             console.error('Progress report error:', data.error);
//             return null;
//         }
//     } catch (error) {
//         console.error('Fetch progress error:', error);
//         return null;
//     }
// }

// // Function to update progress display
// function updateProgressDisplay(progress) {
//     const progressContainer = document.getElementById('progress-container');
//     progressContainer.innerHTML = ''; // Clear previous content

//     const progressByCategory = progress.progress_by_category || {};
//     const progressByLevel = progress.progress_by_level || {};
//     const totalWordsLearned = progress.total_words_learned || 0;

//     // Create a column for each category
//     for (const [category, totalCategoryCount] of Object.entries(progressByCategory)) {
//         const categoryElement = document.createElement('div');
//         categoryElement.className = 'progress-category';

//         // Add category title
//         const categoryTitle = document.createElement('h3');
//         categoryTitle.textContent = `${category} (${totalCategoryCount} words)`;
//         categoryElement.appendChild(categoryTitle);

//         // Add progress for each level within the category
//         const levels = ['Beginner', 'Intermediate', 'Advanced'];
//         levels.forEach(level => {
//             const levelCount = progressByLevel[`${category}-${level}`] || 0;
//             const levelElement = document.createElement('div');
//             levelElement.className = 'progress-level';

//             // Create chart
//             const canvas = document.createElement('canvas');
//             canvas.style.position = 'relative';
//             levelElement.appendChild(canvas);

//             // Calculate the proportion of words learned for the current level
//             const learnedProportion = (levelCount / totalWordsLearned) * 100; // Percentage of words learned in this level
//             const remainingProportion = 100 - learnedProportion; // Remaining words proportion

//             // Set the colors based on the progress (learned vs remaining)
//             const colors = {
//                 Beginner: '#4caf50',   // Green for learned words
//                 Intermediate: '#ff9800', // Orange for learned words
//                 Advanced: '#f44336'    // Red for learned words
//             };
//             const backgroundColor = colors[level] || '#e0e0e0';

//             new Chart(canvas, {
//                 type: 'doughnut',
//                 data: {
//                     labels: [level, 'Remaining'],
//                     datasets: [{
//                         data: [learnedProportion, remainingProportion],
//                         backgroundColor: [backgroundColor, '#e0e0e0'],
//                         borderWidth: 0
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     maintainAspectRatio: false,
//                     cutoutPercentage: 70,
//                     plugins: {
//                         legend: {
//                             display: false
//                         },
//                         tooltip: {
//                             callbacks: {
//                                 label: function (context) {
//                                     return `${context.label}: ${context.raw.toFixed(2)}%`;
//                                 }
//                             }
//                         }
//                     },
//                     plugins: [{
//                         beforeDraw: function (chart) {
//                             const ctx = chart.ctx;
//                             const width = chart.width;
//                             const height = chart.height;
//                             const text = `${levelCount}`; // Display level count as text in the center
//                             const fontSize = (height / 8).toFixed(2);
//                             ctx.restore();
//                             ctx.font = `${fontSize}px Arial`;
//                             ctx.textBaseline = 'middle';
//                             ctx.fillStyle = '#000'; // Text color
//                             const textX = Math.round((width - ctx.measureText(text).width) / 2);
//                             const textY = height / 2;
//                             ctx.fillText(text, textX, textY);
//                             ctx.save();
//                         }
//                     }]
//                 }
//             });

//             // Append progress details
//             levelElement.innerHTML += `
//                 <span>${level}: ${levelCount}/${totalCategoryCount}</span>
//             `;
//             categoryElement.appendChild(levelElement);
//         });

//         // Append total words for the category
//         categoryElement.innerHTML += `
//             <p>Total Words: ${levels.reduce((total, lvl) => total + (progressByLevel[`${category}-${lvl}`] || 0), 0)}</p>
//         `;

//         progressContainer.appendChild(categoryElement);
//     }
// }

// // Add event listener to the button
// document.getElementById('show-progress-btn').addEventListener('click', async () => {
//     const progress = await fetchProgressReport();
//     if (progress) {
//         updateProgressDisplay(progress);
//     } else {
//         alert('Failed to fetch progress report. Please try again later.');
//     }
// });
// Fetch progress report
async function fetchProgressReport() {
    try {
      const response = await fetch('/group8/get-progress-report/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        console.error('Progress report error:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Fetch progress error:', error);
      return null;
    }
  }
  
  // Function to update progress display
  function updateProgressDisplay(progress) {
    const progressContainer = document.getElementById('progress-container');
    progressContainer.innerHTML = ''; // Clear previous content
  
    // We'll assume the back end returns this structure:
    // {
    //   progress_by_category_level: {
    //       animals: {
    //         Beginner: { learned: X, total: Y },
    //         Intermediate: { learned: X, total: Y },
    //         Advanced: { learned: X, total: Y }
    //       },
    //       fruits: {...},
    //       objects: {...}
    //   },
    //   total_words_learned: ...
    // }
  
    const catLevels = progress.progress_by_category_level || {};
    const totalWordsLearned = progress.total_words_learned || 0;
  
    // Predefine categories & levels
    const categories = ['animals', 'fruits', 'objects'];
    const levels = ['beginner', 'intermediate', 'advanced'];
    const colors = ['#4caf50', '#ff9800', '#f44336'];
  
    categories.forEach(category => {
      // Category container
      const categoryElement = document.createElement('div');
      categoryElement.className = 'progress-category';
  
      // Title
      // We'll sum the total words for this category by summing each level's total
      let categoryTotal = 0;
      if (catLevels[category]) {
        levels.forEach(lvl => {
          const lvlData = catLevels[category][lvl] || { learned: 0, total: 0 };
          categoryTotal += lvlData.total;
        });
      }
  
      const categoryTitle = document.createElement('h3');
      const catName = category.charAt(0).toUpperCase() + category.slice(1);
      categoryTitle.textContent = `${catName} (${categoryTotal} words)`;
      categoryElement.appendChild(categoryTitle);
  
      // Now build the 3 levels
      levels.forEach((level, index) => {
        const levelElement = document.createElement('div');
        levelElement.className = 'progress-level';
  
        const lvlData = catLevels[category] && catLevels[category][level]
          ? catLevels[category][level]
          : { learned: 0, total: 0 };
  
        const learnedCount = lvlData.learned;
        const totalCount = lvlData.total;
  
        // Create a canvas for the doughnut
        const canvas = document.createElement('canvas');
        canvas.style.position = 'relative';
        canvas.width = 180;
        canvas.height = 180;
        levelElement.appendChild(canvas);
  
        // Calculate the percentage
        const learnedProportion = (totalCount > 0)
          ? (learnedCount / totalCount) * 100
          : 0;
        const remainingProportion = 100 - learnedProportion;
  
        // Create the chart
        new Chart(canvas, {
          type: 'doughnut',
          data: {
            labels: ['Learned', 'Remaining'],
            datasets: [{
              data: [learnedProportion, remainingProportion],
              backgroundColor: [colors[index], '#e0e0e0'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: context => {
                    const label = context.label;
                    const val = context.raw.toFixed(1) + '%';
                    return `${label}: ${val}`;
                  }
                }
              }
            },
            // custom plugin to display the learnedCount in the center
            plugins: [{
              id: 'centerText',
              beforeDraw: (chart) => {
                const { ctx, chartArea: { width, height } } = chart;
                ctx.save();
                ctx.font = 'bold 20px sans-serif';
                ctx.fillStyle = '#000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${learnedCount}`, width / 2, height / 2);
              }
            }]
          }
        });
  
        // Add a label below the chart
        const levelLabel = document.createElement('span');
        levelLabel.textContent = `${level}: ${learnedCount}/${totalCount}`;
        levelElement.appendChild(levelLabel);
  
        categoryElement.appendChild(levelElement);
      });
  
      progressContainer.appendChild(categoryElement);
    });
  
    // Update total progress count
    const totalWordsLearnedElement = document.getElementById('total-words-learned');
    totalWordsLearnedElement.textContent = `Total Words Learned: ${totalWordsLearned}`;
  }
  
  // On button click
  document.getElementById('show-progress-btn').addEventListener('click', async () => {
    const progress = await fetchProgressReport();
    if (progress) {
      updateProgressDisplay(progress);
    } else {
      alert('Failed to fetch progress report. Please try again later.');
    }
  });
  
  // On DOM load
  document.addEventListener('DOMContentLoaded', async () => {
    const progress = await fetchProgressReport();
    if (progress) {
      updateProgressDisplay(progress);
    } else {
      alert('Failed to fetch progress report. Please try again later.');
    }
  });
  