<?php
header("Content-type: text/html; charset=utf-8");
session_start();
//echo "欢迎 ". $_SESSION['user'];
?>


<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
<!--    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>-->
    <title>橘猫留言板</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="resources/css/bootstrap.css" />
    <link rel="stylesheet" href="resources/css/bootstrap-theme.css" />
    <link rel="stylesheet" href="resources/css/success.css" />
    <script src="resources/js/jquery-1.12.4.js"></script>
    <script src="resources/js/jquery.cookie-1.4.1.min.js"></script>
    <script src="resources/js/bootstrap.js"></script>
    <script src="resources/js/success.js"></script>
</head>

<body>
<div class="nav">橘猫留言板</div>
<div style="height: 60px;width: 100%;"></div>
<div class="content">
    <div class="content_end" style="height: 100px; width: 100%;"></div>
</div>
<form action="" method="post">
    <div class="bottomInp">
        <div class="input" contenteditable="true" name="content"></div>
        <button class="send" onclick="send()" disabled="disabled">发送</button>
    </div>
</form>

</body>
</html>


