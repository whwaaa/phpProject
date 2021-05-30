

var href = window.location.href;

// function loginFun(){
//     var browserID;
//     Fingerprint2.get(function(components) {
//         browserID = Fingerprint2.x64hash128(components.map(function (pair) {return pair.value }).join(), 31);
//         console.log("browserID: "+browserID);
//         $("#browserID").val(browserID);
//     })
//     var email = $("#email").val();
//     $("#getVerCode").off("click");
//
//     $.ajax({
//         url:"verCode.php",
//         type:"post",
//         dataType:"json",
//         data:{"email":email},
//         success:function(result){
//
//         }
//     })
// }
//
// var Int;
// function countDown(){
//     clearInterval(Int);
//     var time = 10;
//     Int = setInterval(function(){
//         time--;
//         $("#getVerCode").val(time);
//         if(time == 0){
//             clearInterval(Int);
//             $("#getVerCode").val("获取验证码");
//             verCodeBut();
//         }
//     },1000);
// }

function verCodeBut(){
    $("#getVerCode").on("click", function () {
        loginFun();
    });
}

$(document).ready(function(){
    window.onload = function(){
        // 查询浏览器是否登录过
        setTimeout(function (){
            Fingerprint2.get(function(components) {
                var browserID = Fingerprint2.x64hash128(components.map(function (pair) {return pair.value }).join(), 31);
                while(browserID == "" || browserID == null){
                    browserID = repair();
                }
                console.log(browserID);
                $.ajax({
                    url:"valVerCode.php",
                    type:"post",
                    dataType:"json",
                    data:{"browIsLogin":true,"browserID":browserID},
                    success:function(result){
                        if(result==true){
                            // 登陆过则跳过登录界面
                            window.location.href = "success.php";
                        }
                    }
                })
            })
        }, 100)

        // 绑定获取验证码
        verCodeBut();

        // 邮箱后缀监听
        mailXYZOnClick();

        // 背景监听
        bcOnClick();

        // 发送验证码监听
        verifOnClick();
    }
})

/**
 *  防止获取browserID失败再次获取
 * @returns {*}
 */
function repair(){
    var browserID;
    setTimeout(function (){
        browserID = Fingerprint2.x64hash128(components.map(function (pair) {return pair.value }).join(), 31);
    },100);
    return browserID;
}


// log动画提示
function log(a){
    var log = document.getElementById("log");
    // 更改提示内容
    $("#log").html(a);
    // 透明度改为不透明
    log.style.opacity = 1;
    // 动画弹出
    $("#log").slideDown(300);
    // 透明淡出动画
    setTimeout(function () {
        var num = 50;
        var Int = null;
        Int = window.setInterval(function(){
            if(--num == 0){
                window.clearInterval(Int);
                $("#log").slideUp(0);
                $("#log").html("");
            }
            log.style.opacity= num*2/100;
        },13);
    },1000);
}



var mailFlag = true;        // 默认为隐藏状态
// 隐藏菜单列表后执行
function add(a){
    // 隐藏菜单列表
    $(".mail-xyz-box").slideUp(300);
    // 显示输入框并且修改值
    $(".mail-zyx-ipt-box").slideDown(300);
    $(".mail-zyx-ipt").val(a);
}
// 邮箱后缀监听
function mailXYZOnClick(){
    $(".mail-xyz-div").on("click",function(){
        mailFlag = false;
        // 隐藏输入框
        $(".mail-zyx-ipt-box").slideUp(0);
        // 显示邮箱后缀列表
        $(".mail-xyz-box").slideDown(400);
        // 开启后缀列表监听
        $(".mail-xyz1").on("click",function () {
            add($(this).html());
            return false;
        });
        $(".mail-xyz2").on("click",function () {
            add($(this).html());
            return false;
        });
        $(".mail-xyz3").on("click",function () {
            add($(this).html());
            return false;
        });
        $(".mail-xyz4").on("click",function () {
            add($(this).html());
            return false;
        });
        $(".mail-xyz-end").on("click",function () {
            add("@");
            // 关闭之前监听，重新开启防止事件冒泡
            $(".mail-xyz-div").off("click");
            $(".mail-xyz-div").on("click",function () {
                return false;
            });
            $(".mail-ipt").on("click",function (){
                return false;
            })
            $(".verif-ipt").on("click",function (){
                return false;
            })
            $(".submit-div").on("click",function (){

                return false;
            })
            return false;
        });
        return false;
    });
}

// 背景监听
function bcOnClick(){
    $("html").on("click", function(){
        // 如果是自定义，点击背景后重新监听下拉菜单并修改ipt
        var val = $(".mail-zyx-ipt").val();
        if(val!="@163.com" && val!="@qq.com" && val!="@yeah.net" && val!="@gmail.com"){
            mailXYZOnClick();
            $(".mail-zyx-ipt").val("@163.com");
        }
        // 如果未隐藏，执行隐藏动画
        if(!mailFlag){
            $(".mail-xyz-box").slideUp(300);
            mailFlag = true;
        }
    });
}


// 验证码发送间隔倒计时动画
function VerificationSuccessfull(){
    // 2.倒计时重发
    var t = 10;
    var int = window.setInterval(function () {
        if(--t == 0){
            window.clearInterval(int);
            $(".verif-button").val("发送验证码");
            verifOnClick();
            return;
        }
        $(".verif-button").val(t);
    },1000);
}

// 发送验证码监听
function verifOnClick(){
    $(".verif-button").on("click", function () {
        log("获取中...");
        // 防止多次发送
        $(".verif-ipt").val("");
        $(".verif-button").off("click");

        var browserID;
        Fingerprint2.get(function(components) {
            browserID = Fingerprint2.x64hash128(components.map(function (pair) {return pair.value }).join(), 31);
            console.log("browserID: "+browserID);
            $("#browserID").val(browserID);
        })
        $("#email").val($(".mail-ipt").val()+$(".mail-zyx-ipt").val());
        $.ajax({
            url:"verCode.php",
            type:"post",
            dataType:"json",
            data:{"email":$(".mail-ipt").val()+$(".mail-zyx-ipt").val()},
            success:function(result){
                if(result==true){     // 验证码发送成功
                    VerificationSuccessfull();
                    $(".submit-div").on("click", function (){
                        $("#loginSubmit").submit();
                    })
                }else{
                    log("获取验证码失败");
                    verifOnClick();
                }
            }
        })

        return false;
    });
}
