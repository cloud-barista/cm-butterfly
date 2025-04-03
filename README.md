

```
🧨 [NOTE]
🧨 cm-butterfly is currently under development.
🧨 So, we do not recommend using the current release in production.
🧨 Please note that the functionalities of cm-butterfly are not stable and secure yet.
🧨 If you have any difficulties in using cm-butterfly, please let us know.
🧨 (Open an issue or Join the cloud-barista Slack)
```
***
- [cm-butterfly](#cm-butterfly)
  - [Overview](#overview)
  - [Prerequisition](#prerequisition)
    - [Recommend Envionment (Test Finished)](#recommend-envionment-test-finished)
  - [How to Run](#how-to-run)
    - [1. Project clone from remote git repository](#1-project-clone-from-remote-git-repository)
    - [2. CM-Butterfly needs to run with cloud-migrator subsystems.](#2-cm-butterfly-needs-to-run-with-cloud-migrator-subsystems)
    - [3.CSP User credential registration ⭐⭐](#3csp-user-credential-registration-)
    - [4. Subsystem's api host and endpoint configuration](#4-subsystems-api-host-and-endpoint-configuration)
    - [5. Self auth settings (Optional)](#5-self-auth-settings-optional)
    - [6. Configure Nginx for Backend API and Access Control](#6-configure-nginx-for-backend-api-and-access-control)
      - [Update backend url nginx reverse proxy configuration](#update-backend-url-nginx-reverse-proxy-configuration)
      - [Restrict aceess based on the `Origin` header](#restrict-aceess-based-on-the-origin-header)
    - [7. Explore Awesome cm-butterfly](#7-explore-awesome-cm-butterfly)
***

# cm-butterfly
## Overview
cm-butterfly is a framework that provides a GUI environment for a multi-cloud migration platform. It provides a GUI that can be used in a user-friendly and consistent manner to migrate infrastructure, applications, and data from on-premise or cloud source environments to the cloud environments.


## Prerequisition
### Recommend Envionment (Test Finished)
  - Ubuntu 22.04
  - Go 1.23.0
  - Docker engine 25.0.0


## How to Run
### 1. Project clone from remote git repository
```bash
git clone https://github.com/cloud-barista/cm-butterfly.git
```

or if you need specific version with minimize the size

```bash
git clone --depth 1 --branch v0.3.0 https://github.com/cloud-barista/cm-butterfly.git
```

### 2. CM-Butterfly needs to run with cloud-migrator subsystems.
cm-butterfly requires execution on each server because it uses the open APIs of several subsystems that make up the cloud migrator project.

To execute each subsystem, you can clone it from the repository of each subsystem.

However, we strongly recommend using the cm-mayfly tool to run the entire platform. It is configured to fully utilize all the features of the cloud-migrator.

Follow the guide in the link. You can run the cloud-migrator with a simple terminal command and access the console.

[cm-mayfly](https://github.com/cloud-barista/cm-mayfly), which provides execution and check status at the cloud migration platform level.


If you want to check the detailed information about each subsystem, please visit the link below.

- [cm-spider](https://github.com/cloud-barista/cb-spider)
- [cm-tumblebug](https://github.com/cloud-barista/cb-tumblebug)
- [cm-honeybee](https://github.com/cloud-barista/cm-honeybee)
- [cm-damselfly](https://github.com/cloud-barista/cm-damselfly)
- [cm-beetle](https://github.com/cloud-barista/cm-beetle)
- [cm-grasshopper](https://github.com/cloud-barista/cm-grasshopper)
- [cm-cicada](https://github.com/cloud-barista/cm-cicada)
- [cm-ant](https://github.com/cloud-barista/cm-ant)



### 3.CSP User credential registration ⭐⭐
> This step is very important, so I've marked it with stars. 

In cm-butterfly, it is necessary to register user credentials for each CSP. Registered user's CSP credentials are used for tasks such as provisioning virtual machines in CSP's remote environment while executing workflow, performnace test preperation, or for retrieving price or cost information from CSP.

Among the subsystems used by cm-butterfly, `CB-TUMBLEBUG` provides a user-friendly process for registering and storing multi-cloud information. It is recommended to register user credentials using the credential registration method provided by `CB-TUMBLEBUG`.

Follow the guide for initializing CB-Tumblebug to configure multi-cloud information.

> 👉 [Initialize CB-Tumblebug to configure Multi-Cloud info](https://github.com/cloud-barista/cb-tumblebug?tab=readme-ov-file#3-initialize-cb-tumblebug-to-configure-multi-cloud-info)


### 4. Subsystem's api host and endpoint configuration

⭐ cm-butterfly reads the `cm-butterfly/api/conf/api.yaml` file to configure the host of the subsystem called by cm-butterfly and the API endpoint of each subsystem.

You can call all the APIs configured in api.yaml through the same request format and response format, and you can call them using the operationId, which is a unique value of each API, to call the API.

> 🧨NOTE🧨<br>
> Except when cm-butterfly and all other servers that are linked are developed in your own local environment, you must use the actual IP address or Domain name, not localhost or 127.0.0.1, because they are accessed from the client's web browser.


Modify the value of services.{subsystem-name}.baseurl. The host currently in use by default is set to the service DNS of the Docker container. If changes are necessary (if there is a IP address or domain), you need to change the corresponding value. Requests will be sent to the URL defined in api.yaml.
   
  ```yaml
  ```yaml

```yaml

  cb-spider: #service name
    version: 0.10.0
    baseurl: http://cb-spider:1024/spider  ## change this end with /spider
    auth: 
      type: basic
      username: 
      password: 
  
  cb-tumblebug:
    version: 0.10.3
    baseurl: http://cb-tumblebug:1323/tumblebug ## change this end with /tumblebug
    auth: 
      type: basic
      username: default
      password: default

  cm-beetle:
    version: 0.3.0
    baseurl: http://cm-beetle:8056/beetle  ## change this end with /beetle
    auth: 

  # others ...
```
 

### 5. Self auth settings (Optional)
By default, cm-butterfly supports one user with migration privileges. (The featrue that add and delete users are not currently provided.)

When the application starts, it reads `./api/conf/authsetting.yaml`, creates `user.dat` in the same conf folder, and then reads the dat file to process user login.

The default user login information is as follows.


> - userId: `cmiguser`
> - userPassword: `cmiguserPassword!`


Before running cm-butterfly, if you want to change the value for login credentials, you need to update user login information to `authsettings.yaml` and run it.


```bash
sed -i 's/id: cmiguser/id: what-ever-you-want-id/' ./api/conf/authsetting.yaml
sed -i 's/password: cmiguserPassword!/password: what-ever-you-want-password/' ./api/conf/authsetting.yaml
```

---



### 6. Configure Nginx for Backend API and Access Control
#### Update backend url nginx reverse proxy configuration
The frontend of cm-butterfly includes a web server, `nginx`. It uses nginx's reverse proxy to make http calls to the backend API.

If the API server is not running in the same container environment but is running remotely, you can modify the web server configuration in `./front/nginx.conf` to specify a reverse proxy for the backend host.

Currently, the container name defined in docker compose is set to DNS using http which is `http://cm-butterfly-api:4000`.

```text
  # other configuration
  proxy_pass <Enter-the-backend-host-here>
```

Here's a simple terminal command for you, just run it from the root of your project.
```bash
sed -i 's|proxy_pass http://cm-butterfly-api:4000;|proxy_pass https://whatever.host.you.want.com|' ./front/nginx.conf

```

#### Restrict aceess based on the `Origin` header

In `./front/nginx.conf`, there is the commented part. 

```text
# if ($http_origin != "http://localhost") {
#     return 403;
# }
```

This commented block is intended to restrict API access to requests comming only from written domain, enhancing security by preventing unauthorized origins.

To enable this functionaliy, simply remove the `#` symbols.

---


### 7. Explore Awesome cm-butterfly
If you run it through docker compose, you can see the login page by accessing `http://localhost/auth/login`. The user credentials are registered with the default ID and password, and if you log in, you can use cm-butterfly, which supports cloud migration.

