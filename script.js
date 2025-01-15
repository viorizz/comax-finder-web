document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('comaxForm').addEventListener('submit', (event) => {
    event.preventDefault();

    // Fetch COMAX data (replace with actual path)
    fetch('./comax_data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const comaxData = data.COMAX; // Assuming your JSON has an array named "COMAX"

        // Get input values from the form
        const wallHeight = parseFloat(document.getElementById('wallHeight').value);
        const rebarDiameter = parseFloat(document.getElementById('rebarDiameter').value);
        const rebarSpacing = parseFloat(document.getElementById('rebarSpacing').value);
        const w1Thickness = parseFloat(document.getElementById('w1Thickness').value);
        const w2Thickness = parseFloat(document.getElementById('w2Thickness').value);

        // Find the optimal COMAX combination
        const result = findOptimalComax(wallHeight, rebarDiameter, rebarSpacing, w1Thickness, w2Thickness, comaxData);

        // Display the result
        displayResult(result);
      });
  });
});

// Function to find the optimal COMAX combination
function findOptimalComax(wallHeight, rebarDiameter, rebarSpacing, w1Thickness, w2Thickness, comaxData) {
  const validBoxes = comaxData.filter(({ Diameter, E, W1_min, W1_max, W2_min, W2_max, p, b }) =>
    Diameter >= rebarDiameter &&
    E === rebarSpacing &&
    W1_min <= w1Thickness &&
    W1_max >= w1Thickness &&
    W2_min <= w2Thickness &&
    W2_max >= w2Thickness &&
    p <= w1Thickness &&
    b <= w1Thickness - 30
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
// Function to display the result in a web alert box
// Function to display the result in a web alert box
function displayResult(result) {
  const modal = document.getElementById("resultModal");
  const modalText = document.getElementById("modalText");
  const downloadLink = document.getElementById("downloadLink");
  const closeButton = document.querySelector(".close-button");

  if (result.bestCombination && result.bestComax) {
    const wallHeight = parseFloat(document.getElementById("wallHeight").value);
    let message = `COMAX Type A ${result.bestComax.Attribute} peut être utilisé.\n`;

    if (wallHeight < 83) {
      message += "1 COMAX de 83 cm peut être utilisé (à couper sur place)."; 
    } else {
      message += `La meilleure combinaison pour votre hauteur d'étage (${wallHeight} cm) est : ${result.bestCombination.num_125} COMAX de 125 cm, ${result.bestCombination.num_83} COMAX de 83 cm`;
    }

    modalText.textContent = message;

    const dxfFileName = `/comax-type-a/A${result.bestComax.Attribute}.dwg`;
    downloadLink.href = dxfFileName; // Set the download link

    modal.style.display = "block"; 
  } else {
    modalText.textContent = "Aucune combinaison de COMAX trouvée. Veuillez vérifier vos valeurs.";
    modal.style.display = "block"; 
  }

  closeButton.addEventListener('click', closeModal);
}

function closeModal() {
  const modal = document.getElementById("resultModal");
  modal.style.display = "none";
}