<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

    class Order {
        function addOrder($json) {
            include "connection.php";
            
            $json = json_decode($json, true);
            
            $productId = $json['productId'];
            $qty = $json['qty'];
            $amount = $json['amount'];
            $transactionId = $json['transactionId'];
            
            try {
                $conn->beginTransaction();
                
                // Insert the order
                $sql = "INSERT INTO tbl_order(order_productId, order_qty, order_amount, order_transactionId) ";
                $sql .= "VALUES(:productId, :qty, :amount, :transactionId)";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(":productId", $productId);
                $stmt->bindParam(":qty", $qty);
                $stmt->bindParam(":amount", $amount);
                $stmt->bindParam(":transactionId", $transactionId);
                $stmt->execute();
                
                // Update the product stock
                $sqlUpdateStock = "UPDATE tbl_product SET product_stock = product_stock - :qty WHERE product_id = :productId";
                $stmtUpdate = $conn->prepare($sqlUpdateStock);
                $stmtUpdate->bindParam(":qty", $qty);
                $stmtUpdate->bindParam(":productId", $productId);
                $stmtUpdate->execute();
                
                $conn->commit();
                $returnValue = $stmt->rowCount() > 0 ? 1 : 0;
                
            } catch (Exception $e) {
                $conn->rollBack();
                $returnValue = 0;
            }
            
            return json_encode(['status' => $returnValue]);
        }

        function voidOrder($json) {
            include "connection.php";
            
            $json = json_decode($json, true);
            
            $productId = $json['productId'];
            $qty = $json['qty'];
            $amount = $json['amount'];
            $transactionId = $json['transactionId'];

            // Insert the order
            $sql = "INSERT INTO tbl_order(order_productId, order_qty, order_amount, order_transactionId) ";
            $sql .= "VALUES(:productId, :qty, :amount, :transactionId)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":productId", $productId);
            $stmt->bindParam(":qty", $qty);
            $stmt->bindParam(":amount", $amount);
            $stmt->bindParam(":transactionId", $transactionId);
            $stmt->execute();

            $returnValue = $stmt->rowCount() > 0 ? 1 : 0;
            
            // try {
            //     $conn->beginTransaction();
                
            //     // Insert the order
            //     $sql = "INSERT INTO tbl_order(order_productId, order_qty, order_amount, order_transactionId) ";
            //     $sql .= "VALUES(:productId, :qty, :amount, :transactionId)";
            //     $stmt = $conn->prepare($sql);
            //     $stmt->bindParam(":productId", $productId);
            //     $stmt->bindParam(":qty", $qty);
            //     $stmt->bindParam(":amount", $amount);
            //     $stmt->bindParam(":transactionId", $transactionId);
            //     $stmt->execute();
                
            //     // Update the product stock
            //     $sqlUpdateStock = "UPDATE tbl_product SET product_stock = product_stock - :qty WHERE product_id = :productId";
            //     $stmtUpdate = $conn->prepare($sqlUpdateStock);
            //     $stmtUpdate->bindParam(":qty", $qty);
            //     $stmtUpdate->bindParam(":productId", $productId);
            //     $stmtUpdate->execute();
                
            //     $conn->commit();
            //     $returnValue = $stmt->rowCount() > 0 ? 1 : 0;
                
            // } catch (Exception $e) {
            //     $conn->rollBack();
            //     $returnValue = 0;
            // }
            
            return json_encode(['status' => $returnValue]);
        }      
    }


    if($_SERVER['REQUEST_METHOD'] == 'GET'){
        $operation = $_GET['operation'];
        $json = isset($_GET['json']) ? $_GET['json'] : "";
    }else if($_SERVER['REQUEST_METHOD'] == 'POST'){
        $operation = $_POST['operation'];
        $json = isset($_POST['json']) ? $_POST['json'] : "";
    }

    $order = new Order();
    switch ($operation){
        case "addOrder":
            echo $order->addOrder($json);
            break;
        case "voidOrder":
            echo $order->voidOrder($json);
            break;
    }

?>