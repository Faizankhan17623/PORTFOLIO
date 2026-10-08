const net = require('net')

// Addresses that belong to the hosting infrastructure itself, never to a visitor.
const internal = new net.BlockList()
for (const [address, prefix] of [['10.0.0.0', 8], ['172.16.0.0', 12], ['192.168.0.0', 16], ['127.0.0.0', 8], ['169.254.0.0', 16], ['100.64.0.0', 10]]) {
  internal.addSubnet(address, prefix, 'ipv4')
}
for (const [address, prefix] of [['::1', 128], ['fc00::', 7], ['fe80::', 10]]) internal.addSubnet(address, prefix, 'ipv6')

const isInternal = (ip) => internal.check(ip, net.isIPv6(ip) ? 'ipv6' : 'ipv4')

// The real visitor IP.
//
// The API runs behind Cloudflare, which puts the visitor's address in `CF-Connecting-IP` and replaces any
// copy a client tries to send. Express's own req.ip (trust proxy = N hops) lands on the host's internal
// proxy instead, so every visitor would share one address (one rate-limit bucket, one "visitor").
// Without that header (other hosting, local development) fall back to the right-most public address in
// X-Forwarded-For, which is the one added by our own proxy rather than anything the client typed, and
// finally to the socket address.
function clientIp(req) {
  const cf = String(req.headers['cf-connecting-ip'] || '').trim()
  if (net.isIP(cf)) return cf

  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',').map((part) => part.trim()).filter((part) => net.isIP(part))
  for (let i = forwarded.length - 1; i >= 0; i -= 1) {
    if (!isInternal(forwarded[i])) return forwarded[i]
  }
  return String(req.socket?.remoteAddress || '')
}

module.exports = { clientIp, isInternal }
