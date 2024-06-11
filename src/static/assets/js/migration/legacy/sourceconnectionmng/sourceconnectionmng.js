var selectedSourceGroupId = "";// connection은 sourceGroup 아래에 있으므로 sourceGroup을 받아야 한다.
var orderType = "name";
$(document).ready(function () {
    //checkbox all
    $("#th_chall").click(function () {
        if ($("#th_chall").prop("checked")) {
            $("input[name=chk]").prop("checked", true);
        } else {
            $("input[name=chk]").prop("checked", false);
        }
    })

    //table 스크롤바 제한
    $(window).on("load resize", function () {
        var vpwidth = $(window).width();
        if (vpwidth > 768 && vpwidth < 1800) {
            $(".dashboard_cont .dataTable").addClass("scrollbar-inner");
            $(".dataTable.scrollbar-inner").scrollbar();
        } else {
            $(".dashboard_cont .dataTable").removeClass("scrollbar-inner");
        }

        setTableHeightForScroll('sourceConnectionListTable', 300);
    });

    selectedSourceGroupId = $("#slectedSourceGroupId").val();

    getSourceConnectionList()
});


// Source Group 삭제
function deleteSourceConnection() {
    var checkedSourceConnectionArr = [];
    var sourceConnectionId = "";
    
    $("input[name='chk']:checked").each(function () {
        checkedSourceConnectionArr.push( $(this).val() );
        sourceConnectionId = $(this).val()
    });

    if (checkedSourceConnectionArr.length == 0) {
        commonAlert("삭제할 대상을 선택하세요.");
        return false;
    }

    if (checkedSourceConnectionArr.length != 1) {
        commonAlert("삭제할 대상을 하나만 선택하세요.");
        return false;
    }
    var url = "/migration/legacy/sourcegroup/" + selectedSourceGroupId + "/connection/" + sourceConnectionId
    //console.log("del sourcegroup url : ", url);

    axios.delete(url, {
        headers: {
            'Content-Type': "application/json"
        }
    }).then(result => {
        var data = result.data;
        console.log(result);
        console.log(data);
        if (result.status == 200 || result.status == 201) {
            displaySourceConnectionInfo("DEL_SUCCESS")
            commonAlert(data.message)
        } else {
            commonAlert(result.data.error)
        }
        
    }).catch((error) => {
        console.warn(error);
        console.log(error.response)
        var errorMessage = error.response.data.error;
        var statusCode = error.response.status;
        commonErrorAlert(statusCode, errorMessage);
    });
}

function getSourceConnectionList(sort_type) {
    if( selectedSourceGroupId == ""){
        commonAlert("Please select SourceConnection first. ")
        return;
    }

    var url = "/migration/legacy/sourcegroup/" + selectedSourceGroupId + "/connection" ;
    axios.get(url, {
        headers: {
            'Content-Type': "application/json"
        }
    }).then(result => {
        console.log("get SourceConnection List : ", result.data);
        
        var data = result.data.sourceConnectionList;

        var html = ""
        var cnt = 0;

        if (data == null) {
            html += '<tr><td class="overlay hidden" data-th="" colspan="5">No Data</td></tr>'

            $("#sourceConnectionList").empty()
            $("#sourceConnectionList").append(html)

            ModalDetail()
        } else {
            if (data.length) {
                if (sort_type) {
                    cnt++;
                    console.log("check : ", sort_type);
                    data.filter(list => list.Name !== "").sort((a, b) => (a[sort_type] < b[sort_type] ? - 1 : a[sort_type] > b[sort_type] ? 1 : 0)).map((item, index) => (
                        html += addSourceConnectionRow(item, index)                       
                    ))
                } else {
                    data.filter((list) => list.Name !== "").map((item, index) => (
                        html += addSourceConnectionRow(item, index)                        
                    ))
                }

                $("#sourceConnectionList").empty()
                $("#sourceConnectionList").append(html)

                ModalDetail()
            }
        }


    }).catch((error) => {
        console.warn(error);
        console.log(error.response)
        var errorMessage = error.response.data.error;
        var statusCode = error.response.status;
        commonErrorAlert(statusCode, errorMessage);
    });
}

// SourceConnection 목록에 Item 추가
function addSourceConnectionRow(item, index) {
    console.log("addSourceConnectionRow " + index);
    console.log(item)
    var html = ""
    html += '<tr onclick="showSourceConnectionInfo(\'' + item.id + '\');">'
        + '<td class="overlay hidden column-50px" data-th="">'
        //+ '<input type="hidden" id="sourceConnection_id_' + index + '" value="' + item.id + '"/>'
        + '<input type="checkbox" name="chk" value="' + item.id + '" id="raw_' + index + '" title="" /><label for="td_ch1"></label> <span class="ov off"></span>'        
        + '</td>'
        + '<td class="btn_mtd ovm" data-th="name">' + item.source_group_id + '<span class="ov"></span></td>'
        + '<td class="btn_mtd ovm" data-th="name">' + item.name + '<span class="ov"></span></td>'
        + '<td class="btn_mtd ovm" data-th="name">' + item.ip_address + '<span class="ov"></span></td>'
        + '<td class="btn_mtd ovm" data-th="name">' + item.ssh_port + '<span class="ov"></span></td>'
        + '<td class="btn_mtd ovm" data-th="name">' + item.status + '<span class="ov"></span></td>'
        //+ '<td class="overlay hidden" data-th="description">' + item.description + '</td>'/
        + '</tr>'
    return html;
}

function ModalDetail() {
    $(".dashboard .status_list tbody tr").each(function () {
        var $td_list = $(this),
            $status = $(".server_status"),
            $detail = $(".server_info");
        $td_list.off("click").click(function () {
            $td_list.addClass("on");
            $td_list.siblings().removeClass("on");
            $status.addClass("view");
            $status.siblings().removeClass("on");
            $(".dashboard.register_cont").removeClass("active");
            $td_list.off("click").click(function () {
                if ($(this).hasClass("on")) {
                    console.log("reg ok button click")
                    $td_list.removeClass("on");
                    $status.removeClass("view");
                    $detail.removeClass("active");
                } else {
                    $td_list.addClass("on");
                    $td_list.siblings().removeClass("on");
                    $status.addClass("view");

                    $status.siblings().removeClass("view");
                    $(".dashboard.register_cont").removeClass("active");
                }
            });
        });
    });
}

function displaySourceConnectionInfo(targetAction) {
    if (targetAction == "REG") {
        $('#sourceConnectionCreateBox').toggleClass("active");
        $('#sourceConnectionInfoBox').removeClass("view");
        $('#sourceConnectionListTable').removeClass("on");
        var offset = $("#sourceConnectionCreateBox").offset();
        $("#TopWrap").animate({ scrollTop: offset.top }, 300);

        // form 초기화
        $("#regName").val('')
        $("#regDescription").val('')
        
        goFocus('sourceConnectionCreateBox');
    } else if (targetAction == "REG_SUCCESS") {
        $('#sourceConnectionCreateBox').removeClass("active");
        $('#sourceConnectionInfoBox').removeClass("view");
        $('#sourceConnectionListTable').addClass("on");

        var offset = $("#sourceConnectionCreateBox").offset();
        $("#TopWrap").animate({ scrollTop: offset.top }, 0);

        // form 초기화
        $("#regName").val('')
        $("#regDescription").val('')
        getSourceConnectionList("name");
    } else if (targetAction == "DEL") {
        $('#sourceConnectionCreateBox').removeClass("active");
        $('#sourceConnectionInfoBox').addClass("view");
        $('#sourceConnectionListTable').removeClass("on");

        var offset = $("#sourceConnectionInfoBox").offset();
        $("#TopWrap").animate({ scrollTop: offset.top }, 300);

    } else if (targetAction == "DEL_SUCCESS") {
        $('#sourceConnectionCreateBox').removeClass("active");
        $('#sourceConnectionInfoBox').removeClass("view");
        $('#sourceConnectionListTable').addClass("on");

        var offset = $("#sourceConnectionInfoBox").offset();
        $("#TopWrap").animate({ scrollTop: offset.top }, 0);

        getSourceConnectionList("name");
    } else if (targetAction == "CLOSE") {
        $('#sourceConnectionCreateBox').removeClass("active");
        $('#sourceConnectionInfoBox').removeClass("view");
        $('#sourceConnectionListTable').addClass("on");

        var offset = $("#sourceConnectionInfoBox").offset();
        $("#TopWrap").animate({ scrollTop: offset.top }, 0);
    }
}

// SourceGroup에 등록 된 connection 목록 표시
function getSourceConnectionInfo(sourceConnectionId) {
    var url = "/migration/legacy/sourcegroup/" + selectedSourceGroupId + "/connection/" + sourceConnectionId;
    
    var html = "";
    axios.get(url, {
        headers: {
        }
    }).then(result => {
        console.log('getSourceConnectionInfo result: ', result)
        // var data = result.data.connectionconfig
        var data = result.data.sourceConnectionInfo
        console.log("source connection data : ", data);
        
    }).catch((error) => {
        console.warn(error);
        console.log(error.response)
    });
}

// Source Connection Valid check
function isCreateValid(){
    var valid = true;
    //var slectedSourceGroupId = $("#slectedSourceGroupId").val();
    if( selectedSourceGroupId == ""){
        commonAlert("Invalid Source group : empty");
        valid = false
    }
    var sourceConnectionName = $("#regName").val();
    if( sourceConnectionName == ""){
        commonAlert("Invalid Source Connection Name");
        valid = false
    }
    return  valid;
}

// Source Connection 추가
function createSourceConnection() {
    //var slectedSourceGroupId = $("#slectedSourceGroupId").val();
    var sourceConnectionName = $("#regName").val();
    var description = $("#regDescription").val();
    var ipAddress = $("#regIpAddress").val();
    var sshPortStr = $("#regSshPort").val();
    var sshPort = parseInt(sshPortStr);
    var user = $("#regUser").val();
    var password = $("#regPassword").val();
    //var publicKey = $("#regPublicKey").val();
    var privateKey = $("#regPrivateKey").val();

    if( isCreateValid()){
    
        var url = "/migration/legacy/sourcegroup/" + selectedSourceGroupId + "/connection"

        
        var obj = {
            "name": sourceConnectionName,
            "description": description,
            "ip_address": ipAddress,
            "ssh_port": sshPort,
            "user": user,
            "password": password,
            //PublicKey: publicKey,
            "private_key": privateKey
        }
        
        if (sourceConnectionName) {
            axios.post(url, obj, {
                // headers: {
                //     'Content-type': 'application/json',
                // }
            }).then(result => {
                console.log("result SourceConnection : ", result);
                var data = result.data;
                console.log(data);
                if (data.status.code == 200 || data.status.code == 201) {
                    commonAlert("Success Create a SourceConnection!!")
                    
                    displaySourceConnectionInfo("REG_SUCCESS")

                } else {
                    commonAlert("Failed to Create SourceConnection " + data.status.message)
                }
                
            }).catch((error) => {
                console.warn(error);
                //console.log(error.response)
                var errorMessage = error.response.data.error;
                var statusCode = error.response.status;
                commonErrorAlert(statusCode, errorMessage)
            });
        } else {
            commonAlert("Input SourceConnection Name")
            $("#regName").focus()
            return;
        }
    }
}

// 선택한 SourceConnection의 상세정보 : 이미 가져왔는데 다시 가져올 필요있나??
function showSourceConnectionInfo(sourceConnectionId) {
    console.log("showSourceConnectionInfo : ", sourceConnectionId);    
    
    var url = "/migration/legacy/sourcegroup/" + selectedSourceGroupId + "/connection/" + sourceConnectionId;

    return axios.get(url, {
        // headers:{
        // }
    }).then(result => {
        console.log(result);
       
        var data = result.data.sourceConnectionInfo
        
        var dtlId = data.id;
        var dtlName = data.name;
        var dtlDescription = data.description;
        var dtlIpAddress = data.ip_address;
        var dtlSshPort = data.ssh_port;
        var dtlUser = data.user;
        var dtlPassword = data.password;
        var dtlPublicKey = data.public_key;
        var dtlPrivateKey = data.private_key;
        var dtlStatus = data.status;
        var dtlFailedMessage = data.failed_message;
        
        $("#dtlId").empty();
        $("#dtlName").empty();
        $("#dtlDescription").empty();
        $("#dtlIpAddress").empty();
        $("#dtlSshPort").empty();
        $("#dtlUser").empty();
        $("#dtlPassword").empty();
        $("#dtlPublicKey").empty();
        $("#dtlPrivateKey").empty();
        $("#dtlStatus").empty();
        $("#dtlFailedMessage").empty();
        
        $('#sourceConnectionName').text(dtlName)
        
        $("#dtlId").val(dtlId);
        $("#dtlName").val(dtlName);
        $("#dtlDescription").val(dtlDescription);
        $("#dtlIpAddress").val(dtlIpAddress);
        $("#dtlSshPort").val(dtlSshPort);
        $("#dtlUser").val(dtlUser);
        $("#dtlPassword").val(dtlPassword);
        $("#dtlPublicKey").val(dtlPublicKey);
        $("#dtlPrivateKey").val(dtlPrivateKey);
        $("#dtlStatus").val(dtlStatus);
        $("#dtlFailedMessage").val(dtlFailedMessage);

    }).catch(function (error) {
        console.log("Network detail error : ", error);
    });
}

// 해당 connection의 infra Data 수집 실행
function collectSourceInfra(){
    if( selectedSourceGroupId == ""){
        commonAlert("Please select SourceConnection first. ")
        return;
    }

    var sourceConnectionId = $("#dtlId").val();    
    var url = "/migration/legacy/sourcegroup/" + selectedSourceGroupId + "/connection/" + sourceConnectionId + "/import/infra" ;
    axios.get(url, {
        headers: {
            'Content-Type': "application/json"
        }
    }).then(result => {
        console.log("get collectSourceInfra : ", result.data);
        
        var data = result.data.infraInfo;
        commonAlert(data.infra_data)
        console.log(data)

    }).catch((error) => {
        console.warn(error);
        console.log(error.response)
        var errorMessage = error.response.data.error;
        var statusCode = error.response.status;
        commonErrorAlert(statusCode, errorMessage);
    });
}

// 해당 connection의 software Data 수집 실행
function collectSourceSoftware(){
    if( selectedSourceGroupId == ""){
        commonAlert("Please select SourceConnection first. ")
        return;
    }

    var sourceConnectionId = $("#dtlId").val();    
    var url = "/migration/legacy/sourcegroup/" + selectedSourceGroupId + "/connection/" + sourceConnectionId + "/import/software" ;
    axios.get(url, {
        headers: {
            'Content-Type': "application/json"
        }
    }).then(result => {
        console.log("get collectSourceInfra : ", result.data);
        
        var data = result.data.softwareInfo;
        commonAlert(data.software_data)
        console.log(data)

    }).catch((error) => {
        console.warn(error);
        console.log(error.response)
        var errorMessage = error.response.data.error;
        var statusCode = error.response.status;
        commonErrorAlert(statusCode, errorMessage);
    });
}

// 해당 connection의 infra Data 수집 결과 표시
function viewSourceInfra(){
    if( selectedSourceGroupId == ""){
        commonAlert("Please select SourceConnection first. ")
        return;
    }

    var sourceConnectionId = $("#dtlId").val();    
    var url = "/migration/legacy/sourcegroup/" + selectedSourceGroupId + "/connection/" + sourceConnectionId + "/infra" ;
    axios.get(url, {
        headers: {
            'Content-Type': "application/json"
        }
    }).then(result => {
        console.log("get collectSourceInfra : ", result.data);
        
        var data = result.data.infraInfo;
        console.log(data)
        //commonAlert(data.compute)
        console.log(data.compute)
        console.log(data.gpu)
        console.log(data.network)
        console.log(data.storage)
        

    }).catch((error) => {
        console.warn(error);
        console.log(error.response)
        var errorMessage = error.response.data.error;
        var statusCode = error.response.status;
        commonErrorAlert(statusCode, errorMessage);
    });
}

// 해당 connection의 software Data 수집 결과 표시
function viewSourceSoftware(){
    if( selectedSourceGroupId == ""){
        commonAlert("Please select SourceConnection first. ")
        return;
    }

    var sourceConnectionId = $("#dtlId").val();    
    var url = "/migration/legacy/sourcegroup/" + selectedSourceGroupId + "/connection/" + sourceConnectionId + "/software" ;
    axios.get(url, {
        headers: {
            'Content-Type': "application/json"
        }
    }).then(result => {
        console.log("get collectSourceInfra : ", result.data);
        
        var data = result.data.softwareInfo;
        console.log(data)
        commonAlert(data.software_data)
        

    }).catch((error) => {
        console.warn(error);
        console.log(error.response)
        var errorMessage = error.response.data.error;
        var statusCode = error.response.status;
        commonErrorAlert(statusCode, errorMessage);
    });
}
