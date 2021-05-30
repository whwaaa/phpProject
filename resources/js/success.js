window.onload = function(){

    // 登录检测
    if($.cookie("user") == undefined){
        reLogin();
    }
    $.ajax({
        url:"getMessage.php",
        type:"post",
        dataType:"json",
        data:{"islogin":true},
        success:function(result){
            if(result == false){
                reLogin();
                return;
            }
        }
    })

    // 读取数据
    readData();

    // 自动调整所有message高度
    messageAutoHeight();

    // 监听输入框高度变化
    $(".input").bind('input propertychange', function() {
        $(".bottomInp").height($(".input").innerHeight()+14);
    })

    $(".input").on("click",function (){
        $(window).scrollTop(9999999);
        setTimeout(function (){
            $(window).scrollTop(9999999);
        },200)
    })

    // 监听文字输入解除disabled
    $(".input").keyup(function () {
        $(".send").prop("disabled", false);
    })

    // 10秒定时刷新数据
    reFreshPage();

}

/**
 * 重新登录
 */
function reLogin(){
    window.location.href = "index.html";
}

/**
 * 调整Message高度
 */
function messageAutoHeight(){
    for(var i=0; i<$(".info").length; i++){
        $(".info").eq(i).parents(".message").height($(".info").eq(i).innerHeight());
    }
}

/**
 * 读取数据
 */
function readData(){
    $.ajax({
        url:"getMessage.php",
        type:"post",
        dataType:"json",
        data:{"query":true},
        success:function(result){
            console.log(result);
            if(result == false){
                reLogin();
                return;
            }
            readShowData(result);
        }
    })
}

/**
 * 10秒定时刷新页面
 */
var reFreshInt;
function reFreshPage(){
    reFreshInt = setInterval(function (){
        readData();
    }, 5000)
}

/**
 * 存储消息并发送邮箱
 */
function send(){
    if($(".input").text() != "" && $(".input").text() != null){
        // 1. 获取内容
        var content = $(".input").text();
        $(".input").text("");
        // 防止多次提交
        $(".send").prop("disabled", true);

        // 2.获取当天0点的时间戳(毫秒), 最后一条消息的时间戳
        // var today = new Date(new Date().toLocaleDateString()).getTime();

        var nowStamp = Date.parse(new Date());
        var lastStamp = $.cookie("lastStamp");
        if(lastStamp == undefined){
            lastStamp = nowStamp;
        }

        // 写入时间
        var hh = new Date(nowStamp).getHours();
        var mm = new Date(nowStamp).getMinutes();
        var showTime = "";
        if(nowStamp-lastStamp>600000){      // 与最后一条消息间隔大于10分钟, 显示时间
            showTime = hh + ":" + mm;
            $(".content_end").before("<div class=\"time\">" + showTime + "</div>");
        }
        // if(nowStamp-today<864000000 && nowStamp-lastStamp>600000){  // 24小时 hh:mm 且大于10分钟
        //     showTime = hh + ":" + mm;
        // }else if(nowStamp-today>864000000 && nowStamp-today<864000000*2){ // 24小时以外48小时以内 昨天 hh:mm
        //     showTime = "昨天 " + hh + ":" + mm;
        // }else if(nowStamp-today>864000000*2){  // 48以外 mm月/dd日 hh:mm
        //     var month = new Date(nowStamp).getMonth()+1;
        //     var dd = new Date(nowStamp).getDate();
        //     showTime = month + "月" + dd + "日  " + hh + ":" + mm;
        // }
        // 更新lastStamp
        $.cookie("lastStamp",nowStamp);

        // 写入内容
        var user = $.cookie("user");
        if(user == "xb"){
            $(".content_end").before("<div class=\"message\">\n" +
                "        <div class=\"status\"></div>\n" +
                "        <div class=\"head right_head xb_head\"></div>\n" +
                "        <div class=\"info right_info xb_info\">" + content + "<div class=\"dot right_dot xb_dot\"></div></div>\n" +
                "    </div>");
        }else if(user == "cc"){
            $(".content_end").before("<div class=\"message\">\n" +
                "        <div class=\"status\"></div>\n" +
                "        <div class=\"head right_head cc_head\"></div>\n" +
                "        <div class=\"info right_info cc_info\">" + content + "<div class=\"dot right_dot cc_dot\"></div></div>\n" +
                "    </div>");
        }else{
            // 登录信息过期,检测重新登录
            alert("cookie已过期,复制需要发送的消息,刷新网页重新试试吧.")
        }
        // 调整高度
        $(".message:last").height($(".info:last").innerHeight());
        $(window).scrollTop(9999999);

        // 信息存入数据库,并发送提醒邮件
        $.ajax({
            url:"send.php",
            type:"post",
            dataType:"json",
            data:{"user":user, "content":content, "showTime":showTime, "nowStamp":nowStamp},
            success:function(result){
                if(result == true){
                    // 发送成功
                    $(".status:last").removeClass("sending")
                }else{
                    // 发送失败
                    $(".status:last").removeClass("sending")
                    $(".status:last").addClass("faild")
                    // 修改数据库中send为n
                    changeDatabaseSendStatus("n",content);
                    // 监听红色感叹号
                    listenfaild();
                }
            }
        })

    }
}

/**
 * 修改数据库中send
 * @param status
 */
function changeDatabaseSendStatus(status,content){
    console.log("发送:"+status+"  to:"+content)
    $.ajax({
        url:"getMessage.php",
        type:"post",
        dataType:"json",
        data:{"changesend":status,"content":content}
    })
}

/**
 * 修改数据库中所有send为y
 */
function changeDatabaseSendStatusToy(){
    $.ajax({
        url:"getMessage.php",
        type:"post",
        dataType:"json",
        data:{"changeallsend":true}
    })
}

/**
 * 解析显示从数据库中读取的消息
 */
function readShowData(result){
    var user = result['user'];
    var content = result['content'];
    var showdatetime = result['showdatetime'];
    var stamp = result['stamp'];
    var read = result['read'];
    var send = result['send'];

    // 1.获取当天24点的时间戳(毫秒), 和最后一条消息的时间戳
    var today = new Date(new Date().toLocaleDateString()).getTime() + 864000000;
    var lastStamp = null;
    if(stamp.length>0){
        lastStamp =  stamp[stamp.length-1];
        $.cookie("lastStamp",lastStamp); // 更新lastStamp （后续不用cookie，待更新）
    }
    $(".time").remove();
    $(".message").remove();
    for(var i=0; i<stamp.length; i++){
        // 1.判断是否显示时间
        var showTime = "";
        var hh = new Date(parseInt(stamp[i])).getHours();
        var mm = new Date(parseInt(stamp[i])).getMinutes();
        console.log(hh+ ":"+mm);
        if(showdatetime[i] == ""){
            // 跳过不显示
        }else if(showdatetime[i].length > 9){     // 1.如果showdatetime.length > 9（直接显示showdatetime）
            showTime = showdatetime;
        }else if(today - parseInt(stamp[i]) < 864000000){     //  today-stamp在24小时内，显示->hh：mm
            showTime = hh + ":" + mm;
        }else if(today-parseInt(stamp[i])>864000000 && today-parseInt(stamp[i])<864000000*2){    // today-stamp在24小时到24小时间，显示->昨天 hh：mm
            showTime = "昨天 " + hh + ":" + mm;
        }else{      // 显示 xx月xx日 hh：mm 并对数据库中showdatetime进行更新
            var month = new Date(parseInt(stamp[i])).getMonth()+1;
            var dd = new Date(parseInt(stamp[i])).getDate();
            showTime = month + "月" + dd + "日  " + hh + ":" + mm;
        }
        if(showTime != ""){
            $(".content_end").before("<div class=\"time\">" + showTime + "</div>");
        }

        // 2.显示内容
        var nowuser = $.cookie("user");
        // console.log("nowuser: "+nowuser);
        // console.log("user: "+user[i]);
        // console.log("-------");
        if(nowuser == "xb" && user[i] == "xb"){        // xb显示自己的消息
            var hidden = "";
            if(read[i] == "y"){     // 如果对方阅读过，则隐藏未阅读提示点
                hidden = "hidden";
            }
            var status = "";
            if(send[i]=="n" && read[i]=="n"){
                status = "faild";
            }
            $(".content_end").before("<div class=\"message\">\n" +
                "        <div class=\"status " + status + "\"></div>\n" +
                "        <div class=\"head right_head xb_head\"></div>\n" +
                "        <div class=\"info right_info xb_info\">" + content[i] + "<div class=\"dot right_dot xb_dot " + hidden + "\"></div></div>\n" +
                "    </div>");
        }else if(nowuser == "xb" && user[i] == "cc"){
            $(".content_end").before("<div class=\"message\">\n" +
                "        <div class=\"status\"></div>\n" +
                "        <div class=\"head left_head cc_head\"></div>\n" +
                "        <div class=\"info left_info cc_info\">" + content[i] + "<div class=\"dot left_dot cc_dot hidden\"></div></div>\n" +
                "    </div>");
        }else if(nowuser == "cc" && user[i] == "cc"){
            var hidden = "";
            if(read[i] == "y"){     // 如果对方阅读过，则隐藏未阅读提示点
                hidden = "hidden";
            }
            var status = "";
            if(send[i]=="n" && read[i]=="n"){
                status = "faild";
            }
            $(".content_end").before("<div class=\"message\">\n" +
                "        <div class=\"status " + status + "\"></div>\n" +
                "        <div class=\"head right_head cc_head\"></div>\n" +
                "        <div class=\"info right_info cc_info\">" + content[i] + "<div class=\"dot right_dot cc_dot " + hidden + "\"></div></div>\n" +
                "    </div>");
        }else if(nowuser == "cc" && user[i] == "xb"){
            $(".content_end").before("<div class=\"message\">\n" +
                "        <div class=\"status\"></div>\n" +
                "        <div class=\"head left_head xb_head\"></div>\n" +
                "        <div class=\"info left_info xb_info\">" + content[i] + "<div class=\"dot left_dot xb_dot hidden\"></div></div>\n" +
                "    </div>");
        }else{
            // 登录信息过期,检测重新登录
            window.location.href = "index.html";
        }
        // 调整高度
        $(".message:last").height($(".info:last").innerHeight());
        $(window).scrollTop(9999999);
    }

    // 监听点击红色感叹号
    listenfaild();
}


/**
 * 监听点击红色感叹号
 */
function listenfaild(){
    $(".faild").on("click", function (){
        var content = $(this).siblings(".info").text();
        // 显示发送图标
        var __this = $(this);
        __this.removeClass("faild")
        __this.addClass("sending")

        // 发送邮件
        $.ajax({
            url:"send.php",
            type:"post",
            dataType:"json",
            data:{"sendMail":true},
            success:function(result){
                if(result == true){
                    // 发送成功
                    $(".status").removeClass("sending")
                    $(".status").removeClass("faild")
                    // 修改数据库中所有send为y
                    changeDatabaseSendStatusToy()
                }else{
                    // 发送失败
                    setTimeout(function (){
                        __this.removeClass("sending")
                        __this.addClass("faild")
                        changeDatabaseSendStatus("n",content);
                    },300)
                }
            }
        })
    })
}

// 无解
function contentAutoHeight(){
    var oldHeight = $(window).height();
    $("body").on("click", function(){
        setTimeout(function (){
            // alert("input高度: " + $(".bottomInp").innerHeight())
            // content高度 = 屏幕高度 - nav高度 - input高度
            // $(".content").height($(window).innerHeight()-60-$(".bottomInp").innerHeight());
            var newHeight = $(window).height();
            // $(".bottomInp").css("bottom",oldHeight-newHeight+"px");
        }, 300);
    })

    // $(".input").on("focus", function (){
    //     setTimeout(function (){
    //         $(".bottomInp").css("bottom","271px");
    //         alert($(window).height())
    //     },300);
    // })
    // $(".input").on("blur", function (){
    //     $(".bottomInp").css("bottom","0");
    //
    //     setTimeout(function (){
    //
    //         alert($(window).height())
    //     },300);
    // })

}

