// Fetch progress report
async function fetchProgressReport() {
  try {
    const response = await fetch('/group8/get-progress-report/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json(); // e.g. { total_words_learned, progress_by_category, progress_by_level }
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

// Function to update the progress display
function updateProgressDisplay(progress) {
    const progressContainer = document.getElementById('progress-container');
    progressContainer.innerHTML = ''; // Clear previous content

    const totalWordsLearned = progress.total_words_learned || 0;
    const progressByCategory = progress.progress_by_category || {};
    const progressByLevel = progress.progress_by_level || {};

    // Display total words learned
    const totalWordsLearnedElement = document.createElement('h3');
    totalWordsLearnedElement.textContent = `Total Words Learned: ${totalWordsLearned}`;
    progressContainer.appendChild(totalWordsLearnedElement);

    // Create progress for each category
    for (const [category, count] of Object.entries(progressByCategory)) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'progress-category';
        const canvas = document.createElement('canvas');
        categoryElement.appendChild(canvas);
        progressContainer.appendChild(categoryElement);

        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: [category, 'Remaining'],
                datasets: [{
                    data: [count, totalWordsLearned - count],
                    backgroundColor: ['#4caf50', '#e0e0e0']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutoutPercentage: 70,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Create progress for each level
    for (const [level, count] of Object.entries(progressByLevel)) {
        const levelElement = document.createElement('div');
        levelElement.className = 'progress-level';
        const canvas = document.createElement('canvas');
        levelElement.appendChild(canvas);
        progressContainer.appendChild(levelElement);

        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: [level, 'Remaining'],
                datasets: [{
                    data: [count, totalWordsLearned - count],
                    backgroundColor: ['#2196f3', '#e0e0e0']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutoutPercentage: 70,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// Add event listener to the button
document.getElementById('show-progress-btn').addEventListener('click', async () => {
    const progress = await fetchProgressReport();
    if (progress) {
        updateProgressDisplay(progress);
    } else {
        alert('Failed to fetch progress report. Please try again later.');
    }
});