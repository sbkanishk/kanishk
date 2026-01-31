
document.addEventListener("DOMContentLoaded", () => {

    /* =====================
       NAV FEEDBACK
    ====================== */
    document.querySelectorAll("nav a").forEach(link => {
        link.addEventListener("click", e => {
            console.log(`Navigated to ${e.target.textContent}`);
        });
    });

    /* =====================
       GUESS THE NUMBER
    ====================== */
    let secretNumber = Math.floor(Math.random() * 10) + 1;

    const input = document.getElementById("guessInput");
    const button = document.getElementById("guessBtn");
    const result = document.getElementById("gameResult");

    button.addEventListener("click", () => {
        const guess = Number(input.value);

        if (!guess || guess < 1 || guess > 10) {
            result.textContent = "❌ Enter a number between 1 and 10";
            return;
        }

        if (guess === secretNumber) {
            result.textContent = "🎉 Correct! New number generated.";
            secretNumber = Math.floor(Math.random() * 10) + 1;
        } else {
            result.textContent = "❌ Wrong! Try again.";
        }
    });

    /* =====================
       CATCH THE STAR ⭐
    ====================== */
    const star = document.getElementById("star");
    const scoreText = document.getElementById("starScore");
    let score = 0;

    star.addEventListener("click", () => {
        score++;
        scoreText.textContent = `Score: ${score}`;

        const x = Math.random() * 200 - 100;
        const y = Math.random() * 100 - 50;

        star.style.transform = `translate(${x}px, ${y}px) scale(1.2)`;
    });

});
