<?php
header("Content-Type: text/html; charset=utf-8  ");
include("sendMail.php");
// 获取邮箱
session_start();
$email = $_POST["email"];

// 生成验证码
$varCode = mt_rand(10000,99999);
$_SESSION['varCode']=$varCode;

// 发送验证码到邮件
$mailContent = "<!DOCTYPE html>\r\n".
    "<html>\r\n".
    "<head>\r\n".
    "    <meta charset=\"UTF-8\">\r\n".
    "    <meta charset=\"UTF-8\" name=\"viewport\" content=\"width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no\">\r\n".
    "</head>\r\n".
    "<body>\r\n".
    "    <div style=\"margin-top: 50px;width: 100%;height: 60px;background: #E89CA8;\">\r\n".
    "        <h1 style=\"text-align:center;color: #393939;line-height:60px;\">登录验证码</h1>\r\n".
    "    </div>\r\n".
    "    <div style=\"width: 80%;margin: 40px auto;text-indent:50px;\">\r\n".
    "        复制下面验证码到登录页面提交就好：\r\n".
    "    </div>\r\n".
    "    <h3 style=\"text-align:center;color: #E89CA8;\">".$varCode."</h3>\r\n".
    "</body>\r\n".
    "</html>";


$data = sendMail($email,"小橘猫留言板",$mailContent);

echo json_encode($data,JSON_UNESCAPED_UNICODE);

