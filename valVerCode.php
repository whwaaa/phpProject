<?php
header("Content-type: text/html; charset=utf-8");
define('sql_servername','localhost');
define('sql_username','root');
define('sql_password', 'xiaojumao');
define('sql_dbname','xiaojumao');

session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!empty($_POST["browIsLogin"])){
        $browserID = test_input($_POST["browserID"]);
        $browIdArr = sql_query("account");
        $arrlength = count($browIdArr["browserid"]);
        $isLogin = false;
        for($x=0;$x<$arrlength;$x++) {
            if($browIdArr["browserid"][$x] == $browserID){    // 若数据库中存在一个匹配的browsid，则返回true
                $isLogin = true;
                // 查询user
                $user = getUser("user", $browIdArr["email"][$x]);
                $_SESSION['user'] = $user;
                setcookie("user",$user,time()+3600);
                // 查询email
                if($user == "xb"){
                    $_SESSION['email'] = getEmail("user", "cc");
                }else{
                    $_SESSION['email'] = getEmail("user", $user);
                }
                break;
            }
        }
        echo json_encode($isLogin,JSON_UNESCAPED_UNICODE);
        exit();
    }

    // 首次登录
    if (!empty($_POST["email"])){
        $email = test_input($_POST["email"]);
        $browserID = test_input($_POST["browserID"]);
        $verCode = test_input($_POST["verCode"]);
        if($verCode == $_SESSION['varCode']){   // 验证成功
            // 查询用户名和邮件,如果不存在再存入数据库
            $user = getUser("user", $email);
            if(empty($user)){
                $user = "cc";
                sql_insert_user("user", $user, $email);
            }
            // 邮件和对应浏览器信息存入数据库
            sql_insert("account", $email, $browserID);
            if($user == "cc"){
                $_SESSION['email'] = getEmail("user","xb");
                $_SESSION['user'] = "cc";
                setcookie("user","cc",time()+3600);
            }else{
                $_SESSION['email'] = getEmail("user","cc");
                $_SESSION['user'] = "xb";
                setcookie("user","xb",time()+3600);
            }
            // 跳转
            header("location:success.php");
        }else{
            header("location:err.html");
        }
    }
}

function test_input($data){
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}


/**
 * MySql数据插入
 * @param $table 要插入的表单
 */
function sql_insert($table, $email, $browserID){
    $con = mysqli_connect(sql_servername,sql_username,sql_password,sql_dbname);
    // 检测连接
    if (mysqli_connect_errno()){
        echo "连接失败: " . mysqli_connect_error();
    }
    // 设置编码，防止中文乱码
    mysqli_query($con , "set names utf8");
    $sql = "INSERT INTO `".$table."` (`email`, `browserid`) VALUES ('".$email."', '".$browserID."')";
    if (mysqli_query($con, $sql)) {
//        echo "新记录插入成功";
    } else {
        echo "Error: " . $sql . "<br>" . mysqli_error($con);
    }
    mysqli_close($con);
}


/**
 * MySql数据插入
 * @param $table 要插入的表单
 */
function sql_insert_user($table, $user, $email){
    $con = mysqli_connect(sql_servername,sql_username,sql_password,sql_dbname);
    // 检测连接
    if (mysqli_connect_errno()){
        echo "连接失败: " . mysqli_connect_error();
    }
    // 设置编码，防止中文乱码
    mysqli_query($con , "set names utf8");
    $sql = "INSERT INTO `".$table."` (`user`, `email`) VALUES ('".$user."', '".$email."')";
    if (mysqli_query($con, $sql)) {
//        echo "新记录插入成功";
    } else {
        echo "Error: " . $sql . "<br>" . mysqli_error($con);
    }
    mysqli_close($con);
}

/**
 * 查询数据库中browsid
 */
function sql_query($table){
    $browIdArr = array("email"=>array(),"browserid"=>array());
    // 创建连接
    $con = mysqli_connect(sql_servername,sql_username,sql_password,sql_dbname);
    // 检测连接
    if (mysqli_connect_errno()){
        echo "连接失败: " . mysqli_connect_error();
    }
    // 设置编码，防止中文乱码
    mysqli_query($con , "set names utf8");
    $sql = "SELECT `email`, `browserid` FROM `".$table."`";
    $result = $con->query($sql);
    if (isset($result) && $result->num_rows > 0) {
        // 输出数据
        $i = 0;
        while($row = $result->fetch_assoc()) {
            $browIdArr["email"][$i] = $row["email"];
            $browIdArr["browserid"][$i++] = $row["browserid"];
        }
    } else {
        echo "0 结果";
    }
    $con->close();
    return $browIdArr;
}

/**
 * 查询user表
 */
function getUser($table, $email){
    $user = null;
    // 创建连接
    $con = mysqli_connect(sql_servername,sql_username,sql_password,sql_dbname);
    // 检测连接
    if (mysqli_connect_errno()){
//        echo "连接失败: " . mysqli_connect_error();
    }
    // 设置编码，防止中文乱码
    mysqli_query($con , "set names utf8");
    $sql = "SELECT * FROM `".$table."` WHERE `email`='".$email."'";
    $result = $con->query($sql);
    if (isset($result) && $result->num_rows > 0) {
        // 输出数据
        $i = 0;
        while($row = $result->fetch_assoc()) {
            $user = $row["user"];
            break;
        }
    }
    $con->close();
    return $user;
}
/**
 * 查询user表
 */
function getEmail($table, $user){
    $email = null;
    // 创建连接
    $con = mysqli_connect(sql_servername,sql_username,sql_password,sql_dbname);
    // 检测连接
    if (mysqli_connect_errno()){
        echo "连接失败: " . mysqli_connect_error();
    }
    // 设置编码，防止中文乱码
    mysqli_query($con , "set names utf8");
    $sql = "SELECT * FROM `".$table."` WHERE `user`='".$user."'";
    $result = $con->query($sql);
    if (isset($result) && $result->num_rows > 0) {
        // 输出数据
        $i = 0;
        while($row = $result->fetch_assoc()) {
            $email = $row["email"];
            break;
        }
    }
    $con->close();
    return $email;
}




function console_log($data)
{
    if (is_array($data) || is_object($data))
    {
        echo("<script>console.log('".json_encode($data)."');</script>");
    }
    else
    {
        echo("<script>console.log('".$data."');</script>");
    }
}











