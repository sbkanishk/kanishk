function updateStatus() {
    const statusElement = document.getElementById('live-status');
    const now = new Date();
    const hour = now.getHours();

    // Your actual 6-8 PM football schedule
    if (hour >= 18 && hour < 20) {
        statusElement.innerText = "⚽ Currently on the Football Pitch";
        statusElement.style.borderColor = "#ffcc00"; 
    } else if (hour >= 23 || hour < 6) {
        statusElement.innerText = "🌙 System Hibernating (Sleeping)";
    } else if (hour >= 9 && hour < 17) {
        statusElement.innerText = "📚 Optimizing Math & Data Models";
    } else {
        statusElement.innerText = "📖 Reading / Processing Reality";
    }
}

// Update status on load
updateStatus();
// Refresh every minute
setInterval(updateStatus, 60000);
