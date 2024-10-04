

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
    - [1. Project clone from remote git repository](#1-project-clone-from-remote-git-repository)
    - [2. cm-butterfly needs to run with cloud-migrator subsystems.](#2-cm-butterfly-needs-to-run-with-cloud-migrator-subsystems)
  - [3.User credential registration ⭐⭐](#3user-credential-registration-)
    - [4. subsystem's api host and endpoint configuration](#4-subsystems-api-host-and-endpoint-configuration)
    - [5. self auth settings](#5-self-auth-settings)
  - [How to Run](#how-to-run)
    - [Change butterfly backend api host](#change-butterfly-backend-api-host)
  - [Explore Awesome cm-butterfly](#explore-awesome-cm-butterfly)
***

# cm-butterfly
## Overview
cm-butterfly is a framework that provides a GUI environment for a multi-cloud migration platform. It provides a GUI that can be used in a user-friendly and consistent manner to migrate infrastructure, applications, and data from on-premise or cloud source environments to the cloud environments.


## Prerequisition

#### Recommend Envionment (Test Finished)
  - Ubuntu 22.04
  - Go 1.23.0
  - Docker engine 25.0.0
  

### 1. Project clone from remote git repository
```bash
git clone https://github.com/cloud-barista/cm-butterfly.git
```

### 2. cm-butterfly needs to run with cloud-migrator subsystems.
cm-butterfly requires execution on each server because it uses the open APIs of several subsystems that make up the cloud migrator project.

To execute each subsystem, you can execute it from the repository of each subsystem, or you can execute the entire platform using [cm-mayfly](https://github.com/cloud-barista/cm-mayfly), which provides execution and status at the cloud migration platform level.

You can check the detailed execution method by checking the README.md of each subsystem.

- [cm-spider](https://github.com/cloud-barista/cb-spider/tree/v0.9.6) (v0.9.6)
- [cm-tumblebug](https://github.com/cloud-barista/cb-tumblebug)
- [cm-honeybee](https://github.com/cloud-barista/cm-honeybee)
- [cm-beetle](https://github.com/cloud-barista/cm-beetle)
- [cm-grasshopper](https://github.com/cloud-barista/cm-grasshopper)
- [cm-cicada](https://github.com/cloud-barista/cm-cicada)
- [cm-ant](https://github.com/cloud-barista/cm-ant)



## 3.User credential registration ⭐⭐
In cm-butterfly, it is necessary to register user credentials for each CSP. Registered user's CSP credentials are used for tasks such as provisioning virtual machines in a remote environment during performance evaluations, or for retrieving price or cost information from CSP.

Among the subsystems used by cm-butterfly, `CB-TUMBLEBUG` provides a user-friendly process for registering and storing multi-cloud information. It is recommended to register user credentials using the credential registration method provided by `CB-TUMBLEBUG`.

Follow the guide for initializing CB-Tumblebug to configure multi-cloud information.

> 👉 [Initialize CB-Tumblebug to configure Multi-Cloud info](https://github.com/cloud-barista/cb-tumblebug?tab=readme-ov-file#3-initialize-cb-tumblebug-to-configure-multi-cloud-info)


### 4. subsystem's api host and endpoint configuration

⭐ cm-butterfly reads the `cm-butterfly/api/conf/api.yaml` file to configure the host of the subsystem called by cm-butterfly and the API endpoint of each subsystem.

You can call all the APIs configured in api.yaml through the same request format and response format, and you can call them using the operationId, which is a unique value of each API, to call the API.

> 🧨NOTE🧨<br>
> Except when cm-butterfly and all other servers that are linked are developed in your own local environment, you must use the actual IP address, not localhost or 127.0.0.1, because they are accessed from the client's web browser.


1) Clone cm-butterfly project if you needed.
  ```bash
  git clone https://github.com/cloud-barista/cm-butterfly.git

  ```

2) Copy sample `api.yaml` file.
  ```bash
  cd cm-butterfly
  cp ./api/conf/api.yaml.sample ./api/conf/api.yaml

  ```

3) Modify the value of services.{subsystem-name}.baseurl.
  ```yaml

    cb-spider: #service name
      version: 0.9.4
      baseurl: http://localhost:1024/spider  ## change this end with /spider
      auth: 
        type: basic
        username: 
        password: 
    
    cb-tumblebug:
      version: 0.9.12
      baseurl: http://localhost:1323/tumblebug ## change this end with /tumblebug
      auth: 
        type: basic
        username: default
        password: default

    cm-beetle:
      version: 0.2.2
      baseurl: http://localhost:8056/beetle  ## change this end with /beetle
      auth: 

    # others ...
  ```


### 5. self auth settings
By default, cm-butterfly supports one user with migration privileges. (The ability to add and delete users is not currently provided.)

When the application starts, it reads ./api/conf/authsetting.yaml, creates user.dat in the same conf folder, and then reads the dat file to process user login.

Before running cm-butterfly, you need to add user login information to authsettings.yaml and run it.

```bash
cp ./api/conf/authsetting.yaml.sample ./api/conf/authsetting.yaml
```

The default user login information is as follows.

- userId: `cmiguser`
- userPassword: `cmiguserPassword!`

Please change the ID and password appropriately as needed!

---

## How to Run
You can run cm-butterfly in a container environment via docker compose.

```bash
cd scripts
docker compose up -d

 ⠴ Network scripts_cm-butterfly-network  Created             2.6s 
 ⠼ Volume "scripts_cm-butterfly-db"      Created             2.5s 
 ✔ Container cm-butterfly-db             Started             1.8s 
 ✔ Container cm-butterfly-api            Started             1.2s 
 ✔ Container cm-butterfly-front          Started             1.4s
```



### Change butterfly backend api host
The front of cm-butterfly includes a web server, nginx. It uses nginx's reverse proxy to make http calls to the backend API.

If the API server is not running in the same container environment but is running remotely, you can modify the web server configuration in `./front/nginx.conf` to specify a reverse proxy for the backend host.

Currently, the container name defined in docker compose is set to DNS using http which is `http://cm-butterfly-api:4000`.

```text
  # other configuration
  proxy_pass <Enter the backend host here>
```

Here's a simple terminal command for you, just run it from the root of your project.
```bash
sed -i 's|proxy_pass http://cm-butterfly-api:4000;|proxy_pass https://whatever.host.you.want.com|' ./front/nginx.conf

```

---


## Explore Awesome cm-butterfly
If you run it through docker compose, you can see the login page by accessing `http://localhost/auth/login`. The user credentials are registered with the default ID and password, and if you log in, you can use cm-butterfly, which supports cloud migration.

