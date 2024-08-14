<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

class Auth {
    function login($json){
        include 'connection.php';

        $json = json_decode($json, true);

        $sql = "SELECT user_id, user_roleId, user_fullname FROM tbl_user WHERE user_username = :username AND user_password = :password";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':username', $json['username']);
        $stmt->bindParam(':password', $json['password']);
        $stmt->execute();
        $returnValue = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($returnValue) {
            return json_encode([
                'roleId' => $returnValue['user_roleId'],
                'fullname' => $returnValue['user_fullname'],
                'userId' => $returnValue['user_id']
            ]);
        } else {
            return json_encode(null);
        }
    }

    function voidAuth($json){
        include 'connection.php';

        $json = json_decode($json, true);

        $sql = "SELECT user_id, user_fullname FROM tbl_user WHERE user_password = :password AND user_roleId = 3";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':password', $json['password']);
        $stmt->execute();
        $returnValue = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($returnValue) {
            return json_encode([
                'fullname' => $returnValue['user_fullname'],
                'userId' => $returnValue['user_id']
            ]);
        } else {
            return json_encode(null);
        }
    }
}

$json = isset($_POST['json']) ? $_POST['json'] : "";
$operation = $_POST['operation'];

$auth = new Auth();
switch ($operation){
    case "login":
        echo $auth->login($json);
        break;
    case 'voidAuth':
        echo $auth->voidAuth($json);
        break;
}
