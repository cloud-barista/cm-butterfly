```
[NOTE]
cm-butterfly is currently under development.
So, we do not recommend using the current release in production.
Please note that the functionalities of cm-butterfly are not stable and secure yet.
If you have any difficulties in using cm-butterfly, please let us know.
(Open an issue or Join the cloud-barista Slack)
```
***

cm-butterfly
==========
cm-butterfly은 Multi-Cloud Project의 일환으로 Legacy System을 cm-butterfly에서 처리해 사용자로 하여금 간단하고 편안하게 클라우드로 Migration 할 수 있게 해준다.
***
## [Index]
- [cm-butterfly](#cm-butterfly)
  - [[Index]](#index)
  - [[설치 환경]](#설치-환경)
  - [[의존성]](#의존성)
  - [[소스 설치]](#소스-설치)
  - [[환경 설정]](#환경-설정)
  - [[cm-butterfly 실행]](#cm-butterfly-실행)
  - [[cm-butterfly 실행-reflex 방식]](#cm-butterfly-실행-reflex-방식)
***
## [설치 환경]
cm-butterfly은 1.19 이상의 Go 버전이 설치된 다양한 환경에서 실행 가능하지만 최종 동작을 검증한 OS는 Ubuntu 22.0.4입니다.

<br>

## [의존성]
cm-butterfly은 내부적으로 cm-honeybee & cm-beetle & cm-cicada의 개방형 API를 이용하기 때문에 각 서버의 연동이 필요합니다.<br>
- [https://github.com/cloud-barista/cm-honeybee](https://github.com/cloud-barista/cm-honeybee) README 참고하여 설치 및 실행 (검증된 버전 : cm-honeybee v0.2)
- [https://github.com/cloud-barista/cm-beetle](https://github.com/cloud-barista/cm-beetle) README 참고하여 설치 및 실행 (검증된 버전 : cm-beetle v0.2)
- [https://github.com/cloud-barista/cm-cicada](https://github.com/cloud-barista/cm-cicada) README 참고하여 설치 및 실행 (검증된 버전 : cm-cicada v0.2)


<br>

## [소스 설치]
- Git 설치
  - `$ sudo apt update`
  - `$ sudo apt install git`

- Go 1.19 이상의 버전 설치<br>
  go mod 기반의 설치로 바뀌면서 Go 1.19 이상의 버전이 필요합니다.<br>

  2024년 6월 기준으로 apt install golang으로는 구 버전이 설치되기 때문에 https://golang.org/doc/install 사이트에서 1.19 이상의 버전을 직접 설치해야 합니다.<br>
  - `$ wget https://golang.org/dl/go1.19.1.linux-amd64.tar.gz`
  - `$ sudo tar -C /usr/local -xzf go1.19.1.linux-amd64.tar.gz`

- Go 환경 설정  
  - `$ echo "export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin" >> ~/.bashrc`
  - `$ echo "export GOPATH=$HOME/go" >> ~/.bashrc`
  - `$ source ~/.bashrc`
  - `$ go version`
  ```
      go version go1.19.1 linux/amd64
  ```

 - cm-butterfly 설치
   - `$ mkdir -p ~/go/src/github.com/cloud-barista`
   - `$ cd ~/go/src/github.com/cloud-barista`
   - `$ git clone https://github.com/cloud-barista/cm-butterfly.git`
   - `$ cd cm-butterfly`
   - `$ go mod download`
   - `$ go mod verify`

<br>

## [환경 설정]
   - conf/setup.env 파일에서 cm-honeybee & cm-beetle & cm-cicada의 실제 URL 정보로 수정합니다.<br><br>
     **[주의사항]**<br> cm-butterfly을 비롯하여 연동되는 모든 서버가 자신의 로컬 환경에서 개발되는 경우를 제외하고는 클라이언트의 웹브라우저에서 접근하기 때문에 localhost나 127.0.0.1 주소가 아닌 실제 IP 주소를 사용해야 합니다.

   - 로그인 Id와 Password의 변경은 conf/setup.env 파일의 LoginEmail & LoginPassword 정보를 수정하세요.<br>
     (기본 값은 admin/admin 입니다.)

   - 초기 Data 구축관련<br>
     내부적으로 [cm-honeybee](https://github.com/cloud-barista/cm-honeybee)와 [cm-beetle](https://github.com/cloud-barista/cm-beetle)의 개방형 API를 사용하므로 입력되는 Key Name및 Key Value는 cm-honeybee 및 cm-beetle의 API 문서를 참고하시기 바랍니다.<br>

     **[중요]**<br>
     cm-beetle 활용(migration execution and control)을 위해서는 대상 Cloud의 연결정보 설정을 먼저 해야 하므로 beetle의 환경설정[예시](https://github.com/cloud-barista/cm-beetle/discussions/73)를 참고해서 설정한 뒤 사용하시기 바랍니다.

<br>

## [cm-butterfly 실행]
  - 일반 실행 
    - `$ cd ~/go/src/github.com/cloud-barista/cm-butterfly`
    - `$ source ./conf/setup.env`
    - `$ go run main.go`
  
<br>

## [cm-butterfly 실행-reflex 방식]
reflex를 이용한 static 파일의 자동 변경 감지및 Reload
  - reflex 설치
    - `$ go get github.com/cespare/reflex`
  - cm-butterfly 실행
    - `$ cd ~/go/src/github.com/cloud-barista/cm-butterfly`
    - `$ source ./conf/setup.env`
    - `$ reflex -r '\.(html|go|js)' -s go run main.go`
