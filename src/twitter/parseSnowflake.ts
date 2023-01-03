const parseSnowflake = (snowFlake: string) => {
  // (val >> 22) + Standard Time
  const unixTimeMs =
    Math.floor(parseInt(snowFlake, 10) / 4194304) + 1288834974657
  return new Date(unixTimeMs)
}

export { parseSnowflake }
