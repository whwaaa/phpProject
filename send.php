<?php
include("sendMail.php");
header("Content-type: text/html; charset=utf-8");
define('sql_servername','localhost');
define('sql_username','root');
define('sql_password', 'xiaojumao');
define('sql_dbname','xiaojumao');

session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!empty($_POST["user"])) {
        $user = $_POST["user"];
        $content = $_POST["content"];
        $showTime = $_POST["showTime"];
        $nowStamp = $_POST["nowStamp"];
        $res = false;
        $res = sql_insert("chat", $user, $content, $showTime, $nowStamp);
        $name = null;
        if($user == "xb"){
            $name = "茶茶";
        }else{
            $name = "小白";
        }
        $mailContent = null;
        if($res == true){
            if(!empty($_SESSION['email']) && !$_SESSION['email']==null && !$_SESSION['email']==""){
                $mailContent = "<html><head><meta charset=\"UTF-8\"></head><body><p style='text-indent:2em;'>收到一条来自".$name."的消息，快点击下方链接进入留言板看看吧🧐</p><br> <p style='margin: 10px auto 0 auto;text-align:center;'><a style='text-align:center;' href='http://xiaojumao.xyz'>http://xiaojumao.xyz</a></p></body></html>";
                $res = sendMail($_SESSION['email'],"小橘猫留言板",$mailContent);  // 发送失败为false
            }else{
                $res = false;
            }
        }
        echo json_encode($res,JSON_UNESCAPED_UNICODE);
    }

    // 重新发送邮件
    if (!empty($_POST["sendMail"])) {
        $name = null;
        if( $_SESSION['user'] == "xb"){
            $name = "茶茶";
        }else{
            $name = "小白";
        }
        $mailContent = "<html><head><meta charset=\"UTF-8\"></head><body><p style='text-indent:2em;'>收到一条来自".$name."的消息，快点击下方链接进入留言板看看吧🧐</p><br> <p style='margin: 10px auto 0 auto;text-align:center;'><a style='text-align:center;' href='http://xiaojumao.xyz'>http://xiaojumao.xyz</a></p></body></html>";
        $res = sendMail($_SESSION['email'],"小橘猫留言板",$mailContent);  // 发送失败为false
        echo json_encode($res,JSON_UNESCAPED_UNICODE);
    }
}

/*
 * MySql数据插入
 * @param $table 要插入的表单
 */
function sql_insert($table, $user, $content, $showTime, $nowStamp){
    $con = mysqli_connect(sql_servername,sql_username,sql_password,sql_dbname);
    // 检测连接
    if (mysqli_connect_errno()){
//        echo "连接失败: " . mysqli_connect_error();
        return false;
    }
    // 设置编码，防止中文乱码
    mysqli_query($con , "set names utf8");
    $sql = "INSERT INTO `".$table."` (`user`, `content`, `showdatetime`, `stamp`) VALUES ('".$user."', '".$content."', '".$showTime."', '".$nowStamp."')";
    if (mysqli_query($con, $sql)) {
        mysqli_close($con);
        return true;
    }
    mysqli_close($con);
//     echo "Error: " . $sql . "<br>" . mysqli_error($con);
    return false;
}
