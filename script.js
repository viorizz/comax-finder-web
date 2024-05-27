// Fetch COMAX data (replace with actual path)
fetch('comax_data.json')
  .then(response => response.json())
  .then(data => {
    const comaxData = data.COMAX; // Assuming your JSON has an array named "COMAX"

    document.getElementById('comaxForm').addEventListener('submit', (event) => {
      event.preventDefault();

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

// Function to find the optimal COMAX combination
function findOptimalComax(wallHeight, rebarDiameter, rebarSpacing, w1Thickness, w2Thickness, comaxData) {
  const validBoxes = comaxData.filter(box =>
    box.Diameter >= rebarDiameter &&
    box.E === rebarSpacing &&
    box.W1_min <= w1Thickness && 
    box.W1_max >= w1Thickness &&
    box.W2_min <= w2Thickness &&
    box.W2_max >= w2Thickness &&
    box.p <= w1Thickness &&
    box.b <= w1Thickness - 30
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
function displayResult(result) {
  if (result.bestCombination && result.bestComax) {
    const wallHeight = parseFloat(document.getElementById('wallHeight').value); 

    let message = `COMAX Type A ${result.bestComax.Attribute} peut être utilisé.\n`;

    if (wallHeight < 83) {
      message += "1 COMAX de 83 cm peut être utilisé (à couper sur place)."; // Adjusted for natural phrasing
    } else {
      message += `La meilleure combinaison pour votre hauteur d'étage (${wallHeight} cm) est : ${result.bestCombination.num_125} COMAX de 125 cm, ${result.bestCombination.num_83} COMAX de 83 cm`;
    }

    alert(message); // Displays the result in an alert box
  } else {
    alert("Aucune combinaison de COMAX trouvée. Veuillez vérifier vos valeurs.");
  }
}

    }
  }
