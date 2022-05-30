export const formatTime = (time: string) => {
  const timeArray = time.split(":")
   return `${formatNumber(Number(timeArray[0]) | 0)}h${formatNumber(Number(timeArray[1]) | 0)}`;
}

export const formatNumber = (n: any) => {
  return (n < 10 ? "0" : "") + n
}

export const formatDate = (day: Date) => {
  return `${day.getDate()}/${day.getMonth()+1}/${day.getFullYear()}`;
}
