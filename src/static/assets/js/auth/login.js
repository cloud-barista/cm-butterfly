
$(document).ready(function () {
    $("#sign_btn").on("click", function () {
        try {
            //  var email = $("#email").val();
            var userID = $("#userID").val();
            var password = $("#password").val();
            if (!password || !userID) {
                $("#required").modal()
                return;
            }

            var req = {
                userID: userID,
                password: password,
            };

            const frm = new FormData()
            frm.append('userID', userID)
            frm.append('password', password)

            console.log(req)
            var url = "/login/proc";
            axios.post(url, frm)
                .then(result => {
                    console.log(result);
                    if (result.status == 200) {
                        console.log("get result Data : ", result.data.LoginInfo);
                        tokenSuccess(result.data.LoginInfo)

                        // var targetUrl = "/migration/workflow/mngform"
                        // changePage(targetUrl)
                        changePage("WorkflowMngForm")

                    } else {
                        commonAlert("ID or PASSWORKD MISMATCH!!Check yourself!")

                    }

                }).catch((error) => {
                    console.log('Error', error);                    
                    if (error.response) {
                        // 요청이 이루어졌으며 서버가 2xx의 범위를 벗어나는 상태 코드로 응답했습니다.
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                    else if (error.request) {                       
                        console.log(error.request);
                    }
                    else {
                        // 오류를 발생시킨 요청을 설정하는 중에 문제가 발생했습니다.
                        console.log('Error', error.message);
                    }
                    console.log(error.config);
                    console.log("login error : ", error);
                    commonAlert(error.message)

                })
        } catch (e) {
            alert(e);
        }

    })

})


// 로그인 성공 시 Token저장
function tokenSuccess(loginInfo) {
    
    console.log(loginInfo)
    // alert("tokenSuccess")
    document.cookie = "UserID=" + loginInfo['UserID'] + ";AccessToken=" + loginInfo['AccessToken'];

}

// 엔터키가 눌렸을 때 실행할 내용
function enterKeyForLogin() {

    if (window.event.keyCode == 13) {
        $("#sign_btn").click();
    }
}

