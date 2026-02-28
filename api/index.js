const allowedDomain = "link4m.com";

const fileMap = {
  ffmax: [
    "https://ffmax.com",
    "https://ffdarg.com"
  ]
};

// Lưu IP tạm thời (serverless memory)
const ipStore = {};

export default function handler(req, res) {

  const referer = req.headers.referer;
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const { file } = req.query;

  // 1️⃣ Check referer tồn tại
  if (!referer) {
    return res.status(403).send("Access denied: No referer.");
  }

  // 2️⃣ Validate referer domain
  try {
    const refUrl = new URL(referer);

    if (refUrl.hostname !== allowedDomain) {
      return res.status(403).send("Access denied: Invalid referer.");
    }

  } catch {
    return res.status(403).send("Access denied: Bad referer format.");
  }

  // 3️⃣ Validate file parameter
  if (!file || !fileMap[file]) {
    return res.status(400).send("Invalid file parameter.");
  }

  // 4️⃣ IP limit (max 3)
  if (!ipStore[ip]) {
    ipStore[ip] = 0;
  }

  if (ipStore[ip] >= 3) {
    return res.status(429).send("Too many attempts. IP blocked.");
  }

  ipStore[ip]++;

  // 5️⃣ Random redirect
  const urls = fileMap[file];
  const randomUrl = urls[Math.floor(Math.random() * urls.length)];

  return res.redirect(302, randomUrl);
}
