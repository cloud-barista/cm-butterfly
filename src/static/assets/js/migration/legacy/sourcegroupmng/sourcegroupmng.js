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

        setTableHeightForScroll('sourceGroupListTable', 300);
    });

    getSourceGroupList()
});


// Source Group 삭제
function deleteSourceGroup() {
    var checkedSourceGroupArr = [];
    var sourceGroupId = "";
    
    $("input[name='chk']:checked").each(function () {
        checkedSourceGroupArr.push( $(this).val() );
        sourceGroupId = $(this).val()
    });

    if (checkedSourceGroupArr.length == 0) {
        commonAlert("삭제할 대상을 선택하세요.");
        return false;
    }

    if (checkedSourceGroupArr.length != 1) {
        commonAlert("삭제할 대상을 하나만 선택하세요.");
        return false;
    }

    var url = "/migration/legacy/sourcegroup/" + sourceGroupId
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
            displaySourceGroupInfo("DEL_SUCCESS")
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

function getSourceGroupList(sort_type) {
    console.log(sort_type);
    // var url = CommonURL + "/ns/" + NAMESPACE + "/resources/vNet";
    //var currentNameSpace = $('$topboxDefaultNameSpaceID').val()
    // defaultNameSpace 기준으로 가져온다. (server단 session에서 가져오므로 변경하려면 현재 namesapce를 바꾸고 호출하면 됨)
    var url = "/migration/legacy/sourcegroup";
    axios.get(url, {
        headers: {
            'Content-Type': "application/json"
        }
    }).then(result => {
        console.log("get SourceGroup List : ", result.data);
        
        var data = result.data.sourceGroupList;

        var html = ""
        var cnt = 0;

        if (data == null) {
            html += '<tr><td class="overlay hidden" data-th="" colspan="5">No Data</td></tr>'

            $("#sourceGroupList").empty()
            $("#sourceGroupList").append(html)

            ModalDetail()
        } else {
            if (data.length) {
                if (sort_type) {
                    cnt++;
                    console.log("check : ", sort_type);
                    data.filter(list => list.Name !== "").sort((a, b) => (a[sort_type] < b[sort_type] ? - 1 : a[sort_type] > b[sort_type] ? 1 : 0)).map((item, index) => (
                        html += addSourceGroupRow(item, index)                       
                    ))
                } else {
                    data.filter((list) => list.Name !== "").map((item, index) => (
                        html += addSourceGroupRow(item, index)                        
                    ))
                }

                $("#sourceGroupList").empty()
                $("#sourceGroupList").append(html)

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

// SourceGroup 목록에 Item 추가
function addSourceGroupRow(item, index) {
    console.log("addSourceGroupRow " + index);
    console.log(item)
    var html = ""
    html += '<tr onclick="showSourceGroupInfo(\'' + item.id + '\');">'
        + '<td class="overlay hidden column-50px" data-th="">'
        //+ '<input type="hidden" id="sourcegroup_id_' + index + '" value="' + item.id + '"/>'
        + '<input type="checkbox" name="chk" value="' + item.id + '" id="raw_' + index + '" title="" /><label for="td_ch1"></label> <span class="ov off"></span>'        
        + '</td>'
        + '<td class="btn_mtd ovm" data-th="name">' + item.name + '<span class="ov"></span></td>'
        + '<td class="btn_mtd ovm" data-th="name">' + item.id + '<span class="ov"></span></td>'
        + '<td class="overlay hidden" data-th="description">' + item.description + '</td>'
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

function displaySourceGroupInfo(targetAction) {
    if (targetAction == "REG") {
        $('#sourceGroupCreateBox').toggleClass("active");
        $('#sourceGroupInfoBox').removeClass("view");
        $('#sourceGroupListTable').removeClass("on");
        var offset = $("#sourceGroupCreateBox").offset();
        // var offset = $("#" + target+"").offset();
        $("#TopWrap").animate({ scrollTop: offset.top }, 300);

        // form 초기화
        $("#regName").val('')
        $("#regDescription").val('')
        
        goFocus('sourceGroupCreateBox');
    } else if (targetAction == "REG_SUCCESS") {
        $('#sourceGroupCreateBox').removeClass("active");
        $('#sourceGroupInfoBox').removeClass("view");
        $('#sourceGroupListTable').addClass("on");

        var offset = $("#sourceGroupCreateBox").offset();
        $("#TopWrap").animate({ scrollTop: offset.top }, 0);

        // form 초기화
        $("#regName").val('')
        $("#regDescription").val('')
        getSourceGroupList("name");
    } else if (targetAction == "DEL") {
        $('#sourceGroupCreateBox').removeClass("active");
        $('#sourceGroupInfoBox').addClass("view");
        $('#sourceGroupListTable').removeClass("on");

        var offset = $("#sourceGroupInfoBox").offset();
        $("#TopWrap").animate({ scrollTop: offset.top }, 300);

    } else if (targetAction == "DEL_SUCCESS") {
        $('#sourceGroupCreateBox').removeClass("active");
        $('#sourceGroupInfoBox').removeClass("view");
        $('#sourceGroupListTable').addClass("on");

        var offset = $("#sourceGroupInfoBox").offset();
        $("#TopWrap").animate({ scrollTop: offset.top }, 0);

        getSourceGroupList("name");
    } else if (targetAction == "CLOSE") {
        $('#sourceGroupCreateBox').removeClass("active");
        $('#sourceGroupInfoBox').removeClass("view");
        $('#sourceGroupListTable').addClass("on");

        var offset = $("#sourceGroupInfoBox").offset();
        $("#TopWrap").animate({ scrollTop: offset.top }, 0);
    }
}

// sourcegroup에 등록 된 connection 목록 표시
function getSourceConnectionInfo(sourceGroupId) {
    // var url = SpiderURL+"/connectionconfig";
    var url = "/setting/connections/cloudconnectionconfig/" + "list"
    // console.log("provider : ",provider)
    // var provider = $("#provider option:selected").val();
    var html = "";
    // var apiInfo = ApiInfo
    axios.get(url, {
        headers: {
            // 'Authorization': apiInfo
        }
    }).then(result => {
        console.log('getConnectionConfig result: ', result)
        // var data = result.data.connectionconfig
        var data = result.data.ConnectionConfig
        console.log("connection data : ", data);
        var count = 0;
        var configName = "";
        var confArr = new Array();
        for (var i in data) {
            if (provider == data[i].ProviderName) {
                count++;
                html += '<option value="' + data[i].ConfigName + '" item="' + data[i].ProviderName + '">' + data[i].ConfigName + '</option>';
                configName = data[i].ConfigName
                confArr.push(data[i].ConfigName)
            }
        }
        if (count == 0) {
            commonAlert("해당 Provider에 등록된 Connection 정보가 없습니다.")
            html += '<option selected>Select Configname</option>';
        }
        if (confArr.length > 1) {
            configName = confArr[0];
        }
        $("#regConnectionName").empty();
        $("#regConnectionName").append(html);

        // }).catch(function(error){
        //     console.log("Network data error : ",error);        
        // });
    }).catch((error) => {
        console.warn(error);
        console.log(error.response)
    });
}


function createSourceGroup() {
    var sourceGroupName = $("#regName").val();
    var description = $("#regDescription").val();
    
    var url = "/migration/legacy/sourcegroup"
    
    var obj = {
        Name: sourceGroupName,
        Description: description,
    }
    
    if (sourceGroupName) {
        axios.post(url, obj, {
            // headers: {
            //     'Content-type': 'application/json',
            // }
        }).then(result => {
            console.log("result sourcegroup : ", result);
            var data = result.data;
            console.log(data);
            if (data.status.code == 200 || data.status.code == 201) {
                commonAlert("Success Create a SourceGroup!!")
                //등록하고 나서 화면을 그냥 고칠 것인가?
                // 등록 성공시 등록한 객체가 들어 옴. 일단 기존 List에 추가하는 것으로?
                // var data = result.data;
                
                displaySourceGroupInfo("REG_SUCCESS")

            } else {
                commonAlert("Failed to Create SourceGroup " + data.message)
            }
            
        }).catch((error) => {
            // console.warn(error);
            console.log(error.response)
            var errorMessage = error.response.data.error;
            var statusCode = error.response.status;
            commonErrorAlert(statusCode, errorMessage)
        });
    } else {
        commonAlert("Input SourceGroup Name")
        $("#regName").focus()
        return;
    }
}

// 선택한 sourceGroup의 상세정보 : 이미 가져왔는데 다시 가져올 필요있나??
function showSourceGroupInfo(sourceGroupId) {
    console.log("showSourceGroupInfo : ", sourceGroupId);    
    
    // var url = CommonURL+"/ns/"+NAMESPACE+"/resources/vNet/"+ vNetId;
    var url = "/migration/legacy/sourcegroup/" + sourceGroupId;

    return axios.get(url, {
        // headers:{
        // }
    }).then(result => {
        console.log(result);
       
        var data = result.data.sourceGroupInfo
        
        var dtlId = data.id;
        var dtlName = data.name;
        var dtlDescription = data.description;
        
        $("#dtlName").empty();        
        $("#dtlDescription").empty();
        
        $('#sourceGroupName').text(dtlName)

        $("#dtlName").val(dtlName);
        $("#dtlDescription").val(dtlDescription);

    }).catch(function (error) {
        console.log("Network detail error : ", error);
    });
}

function displaySubnetRegModal(isShow) {
    if (isShow) {
        $("#subnetRegisterBox").modal();
        $('.dtbox.scrollbar-inner').scrollbar();
    } else {
        $("#vnetCreateBox").toggleClass("active");
    }
}

