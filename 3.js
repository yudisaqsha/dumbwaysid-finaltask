function drawImage(n) {
  if (n % 2 === 0) {
    console.log("Nilai panjang harus ganjil!");
    return;
  }

  for (let i = 1; i <= n; i++) {
    let row = "";
    for (let j = 1; j <= n; j++) {
      if (
        (i == 1 && j == 1) ||
        (i == n && j == n) ||
        (i == 1 && j == n) ||
        (i == n && j == 1) ||
        j == Math.ceil(n / 2) ||
        i == Math.ceil(n / 2)
      ) {
        row += "*";
      } else if (j == Math.ceil(n / 2) && i == Math.ceil(n / 2)) {
        row += "#";
      } else {
        row += "#";
      }
    }
    console.log(row);
  }
}

drawImage(9);
drawImage(8)

// console.log((5+5)%2)
