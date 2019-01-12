const moment = require('moment')

const parseSnowFlake = snowFlake => {
  // (val >> 22) + Standard Time
  const unixTimeMs = Math.floor(parseInt(snowFlake, 10) / 4194304) + 1288834974657
  return moment.utc(unixTimeMs)
}

module.exports = parseSnowFlake
