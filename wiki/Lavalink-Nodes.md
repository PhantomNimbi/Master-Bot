# 🌐 Lavalink Node Topologies

Master-Bot supports three Lavalink node connection topologies:

---

## Topology A: Internal Local Server (Development & Docker)
```env
LAVA_ENABLED=true
LAVA_EXTERNAL=false
LAVA_HOST="127.0.0.1"
LAVA_PORT=2333
LAVA_PASS="youshallnotpass"
```

---

## Topology B: Dedicated External Server (Production)
```env
LAVA_ENABLED=true
LAVA_EXTERNAL=true
LAVA_HOST="lava.yourdomain.com"
LAVA_PORT=443
LAVA_PASS="your_secure_password"
LAVA_SECURE=true
```

---

## Topology C: Public Community Nodes
```env
LAVA_ENABLED=true
LAVA_EXTERNAL=true
LAVA_HOST="public-node.example.com"
LAVA_PORT=2333
LAVA_PASS="public_pass"
LAVA_SECURE=false
```
