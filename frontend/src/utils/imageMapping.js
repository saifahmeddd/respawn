// Import all game images
import eldenringImg from "../assets/images/eldenring.jpeg";
import godofwarImg from "../assets/images/godofwar.jpg";
import gta5Img from "../assets/images/gta5.jpeg";
import rdr2Img from "../assets/images/rdr2.jpeg";
import lolImg from "../assets/images/lol.jpeg";
import tekken8Img from "../assets/images/tekken8.jpeg";
import overwatchImg from "../assets/images/overwatch.jpeg";
import codb06Img from "../assets/images/codb06.jpeg";
import minecraftImg from "../assets/images/minecraft.png";
import lou1Img from "../assets/images/lou1.jpeg";
import lou2Img from "../assets/images/lou2.jpg";
import legoRobloxImg from "../assets/images/lego-roblox-video-game-3840x2160-14270.jpg";
import venomImg from "../assets/images/venom-spider-man-5120x2880-13179.jpg";
import fortniteImg from "../assets/images/fortnite-street-striker-outfit-skin-3840x2160-488.jpg";
import yasukeImg from "../assets/images/yasuke-naoe-3840x2160-21870.jpg";
import racingImg from "../assets/images/racing.jpg";
import racing2Img from "../assets/images/racing2.jpg";
import racing5Img from "../assets/images/racing5.jpg";
import racing6Img from "../assets/images/racing6.jpg";
import racingBlurImg from "../assets/images/racing-blur.jpg";
import defaultImg from "../assets/images/images.jpeg";

// Create an image mapping object
export const imageMap = {
  "eldenring.jpeg": eldenringImg,
  "godofwar.jpg": godofwarImg,
  "gta5.jpeg": gta5Img,
  "rdr2.jpeg": rdr2Img,
  "lol.jpeg": lolImg,
  "tekken8.jpeg": tekken8Img,
  "overwatch.jpeg": overwatchImg,
  "codb06.jpeg": codb06Img,
  "minecraft.png": minecraftImg,
  "lou1.jpeg": lou1Img,
  "lou2.jpg": lou2Img,
  "lego-roblox-video-game-3840x2160-14270.jpg": legoRobloxImg,
  "venom-spider-man-5120x2880-13179.jpg": venomImg,
  "fortnite-street-striker-outfit-skin-3840x2160-488.jpg": fortniteImg,
  "yasuke-naoe-3840x2160-21870.jpg": yasukeImg,
  "racing.jpg": racingImg,
  "racing2.jpg": racing2Img,
  "racing5.jpg": racing5Img,
  "racing6.jpg": racing6Img,
  "racing-blur.jpg": racingBlurImg,
  "default": defaultImg,
};

export const getImage = (imageName) => {
  return imageMap[imageName] || imageMap.default;
}; 