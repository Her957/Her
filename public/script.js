const heart = document.getElementById("heart");
const playPause = document.getElementById("playPause");
const speed = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");
const page = document.querySelector(".hero");

const totalItems = 210;

// Parametric heart curve.
// x = 16 sin^3(t)
// y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
const points = [];

for (let i = 0; i < totalItems; i++) {
  const t = (Math.PI * 2 * i) / totalItems;

  const x = 16 * Math.pow(Math.sin(t), 3);
  const y =
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t);

  points.push({ x, y });
}

// Create several slightly offset copies of the curve so the
// heart looks like a glowing ribbon made from repeated messages.
const rows = [-1.15, -0.7, -0.25, 0.2, 0.65, 1.1];

points.forEach((point, i) => {
  rows.forEach((offset, rowIndex) => {
    const love = document.createElement("div");
    love.className = "love";
    love.textContent = "I love you";

    // Scale the mathematical heart to the CSS heart box.
    const x = point.x * 11.2;
    const y = -point.y * 11.2 + offset * 4;

    // Slight variation gives the text a more organic handwritten/ribbon effect.
    const rotation = Math.atan2(
      points[(i + 1) % points.length].y - point.y,
      points[(i + 1) % points.length].x - point.x
    ) * 180 / Math.PI;

    love.style.left = `calc(50% + ${x}px)`;
    love.style.top = `calc(50% + ${y}px)`;
    love.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    love.style.animationDelay = `${(i * 0.012) + (rowIndex * 0.018)}s`;

    heart.appendChild(love);
  });
}

function updateSpeed() {
  const value = Number(speed.value);
  speedValue.textContent = `${value}x`;

  // Higher value = faster animation.
  document.documentElement.style.setProperty(
    "--animation-speed",
    `${1 / value}s`
  );

  document.querySelectorAll(".love").forEach((item) => {
    item.style.animationDuration = `${0.8 / value}s`;
  });

  heart.style.animationDuration = `${2.8 / value}s`;
}

speed.addEventListener("input", updateSpeed);

playPause.addEventListener("click", () => {
  page.classList.toggle("paused");
  const paused = page.classList.contains("paused");
  playPause.textContent = paused ? "▶" : "❚❚";
  playPause.setAttribute("aria-label", paused ? "Play animation" : "Pause animation");
});

updateSpeed();