<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


    class Transaction {
        function addTransaction($json){
            include "connection.php";
        
            $json = json_decode($json, true);
        
            $cashierId = $json['cashierId'];
            $totalAmount = $json['totalAmount'];
            $cashReceived = $json['cashReceived'];
            $changeGiven = $json['changeGiven'];
            $date = $json['date'];
            $status = $json['status'];
            $discount = $json['discount'];
            
            $sql = "INSERT INTO tbl_transaction(transaction_cashierId, transaction_totalAmount, transaction_cashReceived, transaction_changeGiven, transaction_date, transaction_status, transaction_discounted) 
                    VALUES(:cashierId, :totalAmount, :cashReceived, :changeGiven, :date, :status, :discount)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":cashierId", $cashierId);
            $stmt->bindParam(":totalAmount", $totalAmount);
            $stmt->bindParam(":cashReceived", $cashReceived);
            $stmt->bindParam(":changeGiven", $changeGiven);
            $stmt->bindParam(":date", $date);
            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":discount", $discount);
            $stmt->execute();
        
            try {
                if ($stmt->rowCount() > 0) {
                    $transactionId = $conn->lastInsertId();
                    return json_encode(['transaction_id' => $transactionId]);
                } else {
                    return json_encode(['status' => 0, 'error' => 'No rows affected']);
                }
            } catch (PDOException $e) {
                return json_encode(['status' => 0, 'error' => $e->getMessage()]);
            }
            
        }
        
        function getSalesReport(){
            include "connection.php";

            $sql = "SELECT tbl_transaction.transaction_id, tbl_user.user_fullname, tbl_order.order_qty, tbl_product.product_name, tbl_product.product_price, 
                    tbl_order.order_amount, tbl_transaction.transaction_date, tbl_transaction.transaction_totalAmount 
                    FROM tbl_order
                    INNER JOIN tbl_transaction ON tbl_order.order_transactionId = tbl_transaction.transaction_id
                    INNER JOIN tbl_product ON tbl_order.order_productId = tbl_product.product_id
                    INNER JOIN tbl_user ON tbl_transaction.transaction_cashierId = tbl_user.user_id
                    WHERE tbl_transaction.transaction_status = 1";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $conn = null; $stmt = null;

            return json_encode($returnValue);
        }

        function getShiftReport($json){
            include "connection.php";

            $json = json_decode($json, true);
        
            $cashierId = $json['cashierId'];

            $sql = "SELECT tbl_transaction.transaction_id, tbl_user.user_fullname, tbl_order.order_qty, tbl_product.product_name, tbl_product.product_price, 
                    tbl_order.order_amount, tbl_transaction.transaction_date, tbl_transaction.transaction_totalAmount 
                    FROM tbl_order
                    INNER JOIN tbl_transaction ON tbl_order.order_transactionId = tbl_transaction.transaction_id
                    INNER JOIN tbl_product ON tbl_order.order_productId = tbl_product.product_id
                    INNER JOIN tbl_user ON tbl_transaction.transaction_cashierId = tbl_user.user_id
                    WHERE tbl_user.user_id = :cashierId AND tbl_transaction.transaction_status = 1";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":cashierId", $cashierId);
            $stmt->execute();
            $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $conn = null; $stmt = null;

            return json_encode($returnValue);
        }

        function getVoidReport(){
            include "connection.php";

            $sql = "SELECT tbl_transaction.transaction_id, tbl_user.user_fullname, tbl_order.order_qty, tbl_product.product_name, tbl_product.product_price, 
                    tbl_order.order_amount, tbl_transaction.transaction_date, tbl_transaction.transaction_totalAmount 
                    FROM tbl_order
                    INNER JOIN tbl_transaction ON tbl_order.order_transactionId = tbl_transaction.transaction_id
                    INNER JOIN tbl_product ON tbl_order.order_productId = tbl_product.product_id
                    INNER JOIN tbl_user ON tbl_transaction.transaction_cashierId = tbl_user.user_id
                    WHERE tbl_transaction.transaction_status = 0";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $conn = null; $stmt = null;

            return json_encode($returnValue);
        }

        function getMostRecentSale(){
            include "connection.php";
        
            // Get the most recent transaction ID
            $sql = "SELECT tbl_transaction.transaction_id, tbl_transaction.transaction_date, tbl_transaction.transaction_totalAmount, tbl_user.user_fullname
                    FROM tbl_transaction
                    INNER JOIN tbl_user ON tbl_transaction.transaction_cashierId = tbl_user.user_id
                    WHERE tbl_transaction.transaction_status = 1
                    ORDER BY tbl_transaction.transaction_date DESC
                    LIMIT 1";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $recentTransaction = $stmt->fetch(PDO::FETCH_ASSOC);
        
            if ($recentTransaction) {
                $transactionId = $recentTransaction['transaction_id'];
        
                // Get all products for the most recent transaction
                $sql = "SELECT tbl_order.order_qty, tbl_product.product_name, tbl_product.product_price, tbl_order.order_amount 
                        FROM tbl_order
                        INNER JOIN tbl_product ON tbl_order.order_productId = tbl_product.product_id
                        WHERE tbl_order.order_transactionId = :transactionId";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(':transactionId', $transactionId, PDO::PARAM_INT);
                $stmt->execute();
                $orderDetails = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
                // Merge transaction details with order details
                $recentTransaction['products'] = $orderDetails;
            } else {
                $recentTransaction = [];
            }
        
            $conn = null; $stmt = null;
        
            return json_encode($recentTransaction);
        }
        

        function countCompletedTransactions(){
            include "connection.php";
        
            $sql = "SELECT COUNT(transaction_id) as transactionNum FROM tbl_transaction WHERE transaction_status = 1";
            $stmt = $conn->prepare($sql);
        
            $stmt->execute();
            $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $conn = null; $stmt = null;
        
            return json_encode($returnValue);
        }

        function countVoidTransactions(){
            include "connection.php";
        
            $sql = "SELECT COUNT(transaction_id) as transactionNum FROM tbl_transaction WHERE transaction_status = 0";
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

    $transaction = new Transaction();
    switch ($operation){
        case "addTransaction":
            echo $transaction->addTransaction($json);
            break;
        case "getSalesReport":
            echo $transaction->getSalesReport();
            break;
        case "getShiftReport":
            echo $transaction->getShiftReport($json);
            break;
        case "getVoidReport":
            echo $transaction->getVoidReport($json);
            break;
        case "getMostRecentSale":
            echo $transaction->getMostRecentSale($json);
            break;
        case "countCompletedTransactions":
            echo $transaction->countCompletedTransactions($json);
            break;
        case "countVoidTransactions":
            echo $transaction->countVoidTransactions($json);
            break;
    }

?>