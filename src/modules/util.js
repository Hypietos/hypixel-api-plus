exports.getWoolWarsLevel = async (exp) => { //https://hypixel.net/threads/discord-js-get-woolwars-star-from-exp.4949443/post-35669607
  const minimalExp = [0, 1e3, 3e3, 6e3, 1e4, 15e3]; // NB: progression is 1k, 2k, 3k, 4k, 5k
  const baseLevel = minimalExp.length;
  const baseExp = minimalExp[minimalExp.length - 1];
  return exp < baseExp ? minimalExp.findIndex((x) => exp < x) : Math.floor((exp - baseExp) / 5e3) + baseLevel;
}