<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

    class Cashier {
        function addCashier($json){
            include "connection.php";

            $json = json_decode($json, true);

            $username = $json['username'];
            $password = $json['password'];
            $fullname = $json['fullname'];
            $roleId = $json['roleId'];
            
            $sql = "INSERT INTO tbl_user(user_username, user_password, user_fullname, user_roleId) ";
            $sql .= "VALUES(:username, :password, :fullname, :roleId)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":username", $username);
            $stmt->bindParam(":password", $password);
            $stmt->bindParam(":fullname", $fullname);
            $stmt->bindParam(":roleId", $roleId);
    
            $stmt->execute();
            $returnValue = $stmt->rowCount() > 0 ? 1 : 0;

            return $returnValue;
        }

        function updateCashier($json){
            include "connection.php";

            $json = json_decode($json, true);

            $cashierId = $json['cashierId'];
            $username = $json['username'];
            $password = $json['password'];
            $fullname = $json['fullname'];

            $sql = "UPDATE tbl_user SET user_username = :username, user_password = :password, user_fullname = :fullname ";
            $sql .= "WHERE user_id = :cashierId";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":cashierId", $cashierId);
            $stmt->bindParam(":username", $username);
            $stmt->bindParam(":password", $password);
            $stmt->bindParam(":fullname", $fullname);

            $stmt->execute();
            $returnValue = $stmt->rowCount() > 0 ? 1 : 0;

            return $returnValue;
        }

        // function archiveAndRestoreCashier($json){
        //     include "connection.php";

        //     $json = json_decode($json, true);

        //     $productId = $json['productId'];
        //     $status = $json['status'];

        //     $sql = "UPDATE tbl_product SET product_status = :status ";
        //     $sql .= "WHERE product_id = :productId";
        //     $stmt = $conn->prepare($sql);
        //     $stmt->bindParam(":productId", $productId);
        //     $stmt->bindParam(":status", $status);

        //     $stmt->execute();
        //     $returnValue = $stmt->rowCount() > 0 ? 1 : 0;

        //     return $returnValue;
        // }

        function getCashier(){
            include "connection.php";

            $sql = "SELECT user_id, user_fullname, user_username FROM tbl_user WHERE user_roleId = 2";
            $stmt = $conn->prepare($sql);

            $stmt->execute();
            $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $conn = null; $stmt = null;

            return json_encode($returnValue);
        }

        function loginCashier($json){
            include "connection.php";

            $json = json_decode($json, true);

            $sql = "SELECT user_id, user_fullname FROM tbl_user WHERE user_username = :username AND user_password = :password AND user_roleId = 2";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':username', $json['username']);
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

        function countCashiers(){
            include "connection.php";
        
            $sql = "SELECT COUNT(user_id) as cashierNum FROM tbl_user WHERE user_roleId = 2";
            $stmt = $conn->prepare($sql);
        
            $stmt->execute();
            $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $conn = null; $stmt = null;
        
            return json_encode($returnValue);
        }
    }

    if($_SERVER['REQUEST_METHOD'] == 'GET'){
        $operation = $_GET['operation'];
        $json = isset($_GET['json']) ? $_GET['json'] : "";
    }else if($_SERVER['REQUEST_METHOD'] == 'POST'){
        $operation = $_POST['operation'];
        $json = isset($_POST['json']) ? $_POST['json'] : "";
    }

    $cashier = new Cashier();
    switch ($operation){
        case "addCashier":
            echo $cashier->addCashier($json);
            break;
        case "updateCashier":
            echo $cashier->updateCashier($json);
            break;
        case "countCashiers":
            echo $cashier->countCashiers($json);
            break;
        case "getCashier":
            echo $cashier->getCashier();
            break;
        case "loginCashier":
            echo $cashier->loginCashier($json);
            break;
    }

?>