document.addEventListener("DOMContentLoaded", () => {
  let activeTab = "A"; // Default tab is Type A
  const tabs = document.querySelectorAll(".tab-button");
  const comaxForm = document.getElementById("comaxForm");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((btn) => btn.classList.remove("active"));
      tab.classList.add("active");
      activeTab = tab.id === "tabA" ? "A" : "B";
    });
  });

  comaxForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const dataFile = activeTab === "A" ? "comax_A_data.json" : "comax_B_data.json";
    fetch(dataFile)
      .then((response) => response.json())
      .then((data) => {
        const comaxData = data.COMAX;

        const wallHeight = parseFloat(document.getElementById("wallHeight").value);
        const rebarDiameter = parseFloat(document.getElementById("rebarDiameter").value);
        const rebarSpacing = parseFloat(document.getElementById("rebarSpacing").value);
        const w1Thickness = parseFloat(document.getElementById("w1Thickness").value);
        const w2Thickness = parseFloat(document.getElementById("w2Thickness").value);

        const result =
          activeTab === "A"
            ? findOptimalComax(wallHeight, rebarDiameter, rebarSpacing, w1Thickness, w2Thickness, comaxData)
            : findOptimalComaxB(wallHeight, rebarDiameter, rebarSpacing, w1Thickness, w2Thickness, comaxData);

        displayResult(result);
      });
  });
});

function findOptimalComaxB(wallHeight, rebarDiameter, rebarSpacing, w1Thickness, w2Thickness, comaxData) {
  const validBoxes = comaxData.filter(({ Diameter, E, W1_min, W1_max, W2_min, W2_max, p, z }) =>
    Diameter >= rebarDiameter &&
    E === rebarSpacing &&
    W1_min <= w1Thickness &&
    W1_max >= w1Thickness &&
    W2_min <= w2Thickness &&
    W2_max >= w2Thickness &&
    p + z <= w1Thickness
  );

  if (validBoxes.length === 0) {
    return { bestCombination: null, bestComax: null };
  }

  const bestComax = validBoxes[0]; // Choose the first valid COMAX (can be adjusted)

  let bestCombination = null;
  let closestHeightDiff = Infinity;
  for (let num125 = 0; num125 <= Math.floor(wallHeight / 125); num125++) {
    const remainingHeight = wallHeight - num125 * 125;
    const num83 = Math.floor(remainingHeight / 83);
    const totalHeight = num125 * 125 + num83 * 83;
    const heightDiff = Math.abs(wallHeight - totalHeight);

    if (heightDiff < closestHeightDiff) {
      closestHeightDiff = heightDiff;
      bestCombination = { num_125: num125, num_83: num83 };
    }
  }

  return { bestCombination, bestComax };
}