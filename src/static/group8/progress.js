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

    const totalWordsLearned = progress.total_words_learned || 0;
    const progressByCategory = progress.progress_by_category || {};
    const progressByLevel = progress.progress_by_level || {};

    const categories = ['animals', 'fruits', 'objects'];
    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    const colors = ['#4caf50', '#ff9800', '#f44336'];

    categories.forEach(category => {
        // Create a column for each category
        const categoryElement = document.createElement('div');
        categoryElement.className = 'progress-category';

        // Title
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryElement.appendChild(categoryTitle);

        // Total words in this category
        const totalWordsInCategory = progressByCategory[category] || 0;

        // Create a circle for each level
        levels.forEach((level, index) => {
            const levelCount = progressByLevel[`${category}-${level}`] || 0;
            const levelElement = document.createElement('div');
            levelElement.className = 'progress-level';

            // Create chart canvas
            const canvas = document.createElement('canvas');
            canvas.style.position = 'relative';
            levelElement.appendChild(canvas);

            // Calculate percentage within this category
            const learnedProportion = totalWordsInCategory
                ? (levelCount / totalWordsInCategory) * 100
                : 0;
            const remainingProportion = 100 - learnedProportion;

            new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: [level, 'Remaining'],
                    datasets: [{
                        data: [learnedProportion, remainingProportion],
                        backgroundColor: [colors[index], '#e0e0e0'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutoutPercentage: 70,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => `${context.label}: ${context.raw.toFixed(2)}%`
                            }
                        }
                    },
                    plugins: [{
                        beforeDraw: (chart) => {
                            const ctx = chart.ctx;
                            const width = chart.width;
                            const height = chart.height;
                            const text = `${levelCount}`;
                            const fontSize = (height / 8).toFixed(2);
                            ctx.restore();
                            ctx.font = `${fontSize}px Arial`;
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = '#000';
                            const textX = Math.round((width - ctx.measureText(text).width) / 2);
                            const textY = height / 2;
                            ctx.fillText(text, textX, textY);
                            ctx.save();
                        }
                    }]
                }
            });

            levelElement.innerHTML += `
                <span>${level}: ${levelCount}/${totalWordsInCategory}</span>
            `;
            categoryElement.appendChild(levelElement);
        });

        // Display total words for the category
        categoryElement.innerHTML += `
            <p>Total Words: ${totalWordsInCategory}</p>
        `;
        progressContainer.appendChild(categoryElement);
    });

    // Update total progress count
    const totalWordsLearnedElement = document.getElementById('total-words-learned');
    totalWordsLearnedElement.textContent = `Total Words Learned: ${totalWordsLearned}`;
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

// Ensure the progress display is updated when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const progress = await fetchProgressReport();
    if (progress) {
        updateProgressDisplay(progress);
    } else {
        alert('Failed to fetch progress report. Please try again later.');
    }
});
