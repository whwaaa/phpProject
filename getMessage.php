<?php
header("Content-type: text/html; charset=utf-8");
define('sql_servername','localhost');
define('sql_username','root');
define('sql_password', 'xiaojumao');
define('sql_dbname','xiaojumao');

session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!empty($_POST["query"])) {
        // 更新阅读过的read标记
        if(!empty($_SESSION['user'])){
            if($_SESSION['user'] == "xb"){
                // 更新cc的read
                updateRead("cc");
            }else{
                // 更新xb的read
                updateRead("xb");
            }
        }else{
            echo json_encode(false,JSON_UNESCAPED_UNICODE);
            header("index.html");
        }

        // 查询所有数据
        $browIdArr = sql_query("chat");
        echo json_encode($browIdArr,JSON_UNESCAPED_UNICODE);
    }

    // 更新发送邮成功件标记
    if (!empty($_POST["changesend"])) {
        $sendStatu = $_POST["changesend"];
        $content = $_POST["content"];
        updateSend($sendStatu, $content);
    }
    if (!empty($_POST["changeallsend"])) {
        updateAllSendToy();
    }

    // 查询session是否过期,过期则重登
    if(!empty($_POST["islogin"])){
        if(!empty($_SESSION['user']) && !empty($_SESSION['email'])){
            echo json_encode(true,JSON_UNESCAPED_UNICODE);
        }else{
            echo json_encode(false,JSON_UNESCAPED_UNICODE);
        }
    }
}




/**
 * 查询数据库中browsid
 */
function sql_query($table){
    $browIdArr = array("user"=>array(),"showdatetime"=>array(),"content"=>array(),"stamp"=>array(),"read"=>array(),"send"=>array());
    // 创建连接
    $con = mysqli_connect(sql_servername,sql_username,sql_password,sql_dbname);
    // 检测连接
    if (mysqli_connect_errno()){
//        echo "连接失败: " . mysqli_connect_error();
        return null;
    }
    // 设置编码，防止中文乱码
    mysqli_query($con , "set names utf8");
    $sql = "SELECT * FROM `".$table."`";
    $result = $con->query($sql);
    if (isset($result) && $result->num_rows > 0) {
        // 输出数据
        $i = 0;
        while($row = $result->fetch_assoc()) {
            $browIdArr["user"][$i] = $row["user"];
            $browIdArr["showdatetime"][$i] = $row["showdatetime"];
            $browIdArr["content"][$i] = $row["content"];
            $browIdArr["stamp"][$i] = $row["stamp"];
            $browIdArr["read"][$i] = $row["read"];
            $browIdArr["send"][$i++] = $row["send"];
        }
    } else {
//        echo "0 结果";
        return null;
    }
    $con->close();
    return $browIdArr;
}


/**
 * 更新数据库中read
 */
function updateRead($user){
    $con = mysqli_connect(sql_servername,sql_username,sql_password,sql_dbname);
    // 检测连接
    if (mysqli_connect_errno()) {
        echo "连接失败: " . mysqli_connect_error();
    }
    mysqli_query($con , "set names utf8");
    mysqli_query($con,"UPDATE `chat` SET `read`='y' WHERE `user`='".$user."'");
    mysqli_close($con);
}

/**
 * 更新数据库中read
 */
function updateSend($sendStatu, $content){
    $con = mysqli_connect(sql_servername,sql_username,sql_password,sql_dbname);
    // 检测连接
    if (mysqli_connect_errno()) {
        echo "连接失败: " . mysqli_connect_error();
    }
    mysqli_query($con , "set names utf8");
    mysqli_query($con,"UPDATE `chat` SET `send`='".$sendStatu."' WHERE `content`='".$content."'");
    mysqli_close($con);
}
function updateAllSendToy(){
    $con = mysqli_connect(sql_servername,sql_username,sql_password,sql_dbname);
    // 检测连接
    if (mysqli_connect_errno()) {
        echo "连接失败: " . mysqli_connect_error();
    }
    mysqli_query($con , "set names utf8");
    mysqli_query($con,"UPDATE `chat` SET `send`='y' WHERE `user`='".$_SESSION['user']."'");
    mysqli_close($con);
}