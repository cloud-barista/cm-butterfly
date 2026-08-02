# Checking that source servers can be reached

Before anything can be collected from a source service, the servers under it have to be reachable. **Refresh** on the source service contacts each one over SSH, checks the agent, and shows the result.

Collection reads the servers directly, so a server that cannot be reached now cannot be collected from now. Checking first saves finding out halfway through.

---

## 1. Reading the status

Press **Refresh** on the source service. The status shown is for the whole group.

| Status | What it means |
|---|---|
| `success` | Every server answered |
| `partialSuccess` | Some answered, some did not |
| `failed` | None answered |
| `Unknown` | The group has no servers under it yet |

`partialSuccess` is not a failure of the group - it can still be used, but **only the servers that answered will be collected from**. Which ones those are is worth knowing before going further.

![all servers reachable](https://raw.githubusercontent.com/wiki/cloud-barista/cm-butterfly/assets/source-service-status/success.png)

## 2. Seeing each server on its own

Point at the status for a quick answer. With a couple of servers it shows each one; beyond that it only counts how many answered, because a layer that closes when the pointer leaves cannot be scrolled.

**View Messages**, next to Refresh, opens every server under the group. It stays until it is closed and scrolls when the list is long.

For each server it separates two things:

- **Connection** - whether the machine answered on SSH at all
- **Agent** - whether the agent could be checked once the machine answered

They fail for different reasons, so they are worth telling apart. Under each, the message is what the server itself reported - it is not rewritten.

![some servers reachable, some not](https://raw.githubusercontent.com/wiki/cloud-barista/cm-butterfly/assets/source-service-status/partial.png)

## 3. When a server did not answer

![no server reachable](https://raw.githubusercontent.com/wiki/cloud-barista/cm-butterfly/assets/source-service-status/failed.png)

**Read the message first.** It usually names the cause, and the two most common ones read very differently:

| Message | Usually means |
|---|---|
| `no route to host` | Nothing is listening at that address - the machine is off, or the address is wrong |
| `i/o timeout` | The address exists but nothing came back in time - often a firewall or security group |
| `permission denied` | The machine answered and refused the credentials - user, password or key |

Then work through this, in order:

1. **Check the connection details you registered** - address, SSH port, user, and the password or private key. A key pasted with a missing line, or the wrong user for the image, both look like a refusal.
2. **Check the server is running.** A stopped machine cannot answer, and no amount of retrying changes that.
3. **Check the network in between.** The server has to accept SSH *from this system*, not only from your own machine - security groups, firewalls and private addressing are the usual causes.
4. **Press Refresh again.** The status is read from the servers each time, so it changes as soon as they answer. Nothing needs to be re-registered.

> The status is never a memory of an earlier check - it is what the servers said the last time they were asked. If a server was stopped and then started, Refresh is all it takes for it to show as reachable again.
