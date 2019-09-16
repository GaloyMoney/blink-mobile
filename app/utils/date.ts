
export const sameDay = (d1, d2) => {
  if (typeof d2 == "number") {
    d2 = new Date(d2);
  }

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
  
export const sameMonth = (d1, d2) => {
  if (typeof d2 == "number") {
    d2 = new Date(d2);
  }

  return (
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
  );
}