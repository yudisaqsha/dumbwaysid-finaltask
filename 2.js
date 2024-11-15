function bubbleSort() {
  let arr = [20, 12, 35, 11, 17, 9, 58, 23, 69, 21];
  let tmp;
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < (arr.length - i - 1); j++) {
      if (arr[j+1] < arr[j]) {
        tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
      }
    }
  }
  console.log(arr)
}

bubbleSort()