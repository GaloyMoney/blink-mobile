export const mergeByTimestamp = (arr1: any[], arr2: any[]) => {
  const mergedArr: any[] = []

  let i = 0
  let j = 0
  while (arr1.length != i && arr2.length != j) {
    console.log(arr1[i]?.timestamp > arr2[j]?.timestamp)
    if (arr1[i]?.timestamp > arr2[j]?.timestamp) {
      mergedArr.push(arr1[i])
      i++
    } else {
      mergedArr.push(arr2[j])
      j++
    }
  }

  while (arr1.length !== i) {
    mergedArr.push(arr1[i])
    i++
  }

  while (arr2.length !== j) {
    mergedArr.push(arr2[j])
    j++
  }

  return mergedArr
}
