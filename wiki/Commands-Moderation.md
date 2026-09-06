# 🔨 Moderation Commands Reference

Complete reference for guild moderation commands with role hierarchy checks.

---

## Moderation Commands

| Command | Description | Required Permissions | Usage |
| :--- | :--- | :--- | :--- |
| `/ban` | Ban a user from the server | `BanMembers` | `/ban user: @user reason: "Spamming"` |
| `/kick` | Kick a user from the server | `KickMembers` | `/kick user: @user reason: "Breaking rules"` |
| `/timeout` | Timeout (mute) a user for a duration | `ModerateMembers` | `/timeout user: @user duration: 10m reason: "Toxic"` |
| `/slowmode` | Set channel message slowmode rate limit | `ManageChannels` | `/slowmode seconds: 5` |
| `/purge` | Bulk delete a specified number of messages | `ManageMessages` | `/purge amount: 25` |
