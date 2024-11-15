function countBarang(x, y) {
  let price = 0;
  let total_before = 0;
  let total_after = 0;
  let potongan = 0;
  if (x === "A" || x === "a") {
    price = 4550;
    total_before = price * y;
    if (y > 13) {
      price -= 231;
      total_after = price * y;
      potongan = 231 * y;
    }
  } else if (x === "B" || x === "b") {
    price = 5330;
    total_before = price * y;
    if (y > 7) {
      total_after = Math.ceil(total_before - (total_before * (23 / 100)));
      potongan = Math.ceil(total_before * (23 / 100));
    }
  } else if (x === "C" || x === "c") {
    price = 8653;
    total_before = price * y;
    total_after = total_before;
  } else {
    return console.log('Invalid input')
  }
  console.log("Total harga :" + total_before);
  console.log("potongan : " + potongan);
  console.log("Total yang harus dibayar : " + total_after);
}

countBarang("A", 16);
countBarang("c", 8);
countBarang('B',18)
