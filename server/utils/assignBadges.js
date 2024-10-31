const BADGE_CRITERIA = {
  TOTAL_POINTS: {
    BRONZE: 600,
    SILVER: 1000,
    GOLD: 5000,
  },
};

module.exports = assignBadges = (params) => {
  // console.log(params)
  const badgeCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };
  const { criteria } = params;
  criteria.forEach((item) => {
    const { type, count } = item;
    const badgeLevels = BADGE_CRITERIA[type];
    Object.keys(badgeLevels).forEach((level) => {
      if (count >= badgeLevels[level]) {
        badgeCounts[level] += 1;
      }
    });
  });
  return badgeCounts;
};
