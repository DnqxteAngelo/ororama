<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

    class Product {
        function addProduct($json){
            include "connection.php";

            $json = json_decode($json, true);

            $barcode = $json['barcode'];
            $name = $json['name'];
            $price = $json['price'];
            $status = $json['status'];
            $stock = $json['stock'];
            
            $sql = "INSERT INTO tbl_product(product_name, product_price, product_barcode, product_status, product_stock) ";
            $sql .= "VALUES(:name, :price, :barcode, :status, :stock)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":price", $price);
            $stmt->bindParam(":barcode", $barcode);
            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":stock", $stock);
    
            $stmt->execute();
            $returnValue = $stmt->rowCount() > 0 ? 1 : 0;

            return $returnValue;
        }

        function updateProduct($json){
            include "connection.php";
        
            $json = json_decode($json, true);
        
            $productId = $json['productId'];
            $barcode = $json['barcode'];
            $name = $json['name'];
            $price = $json['price'];
            $stock = $json['stock'];
        
            // Check if stock is zero and update status accordingly
            $status = $stock == 0 ? 0 : 1;
        
            $sql = "UPDATE tbl_product SET product_name = :name, product_price = :price, product_barcode = :barcode, product_stock = :stock, product_status = :status ";
            $sql .= "WHERE product_id = :productId";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":productId", $productId);
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":price", $price);
            $stmt->bindParam(":barcode", $barcode);
            $stmt->bindParam(":stock", $stock);
            $stmt->bindParam(":status", $status);
        
            $stmt->execute();
            $returnValue = $stmt->rowCount() > 0 ? 1 : 0;
        
            return $returnValue;
        }
        

        function archiveAndRestoreProduct($json){
            include "connection.php";
        
            $json = json_decode($json, true);
        
            $productId = $json['productId'];
            $status = $json['status'];
        
            // Prevent restoring a product with stock = 0
            $sql = "UPDATE tbl_product SET product_status = :status ";
            $sql .= "WHERE product_id = :productId AND (product_stock > 0 OR :status = 0)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(":productId", $productId);
            $stmt->bindParam(":status", $status);
        
            $stmt->execute();
            $returnValue = $stmt->rowCount() > 0 ? 1 : 0;
        
            return $returnValue;
        }
        

        function getProduct(){
            include "connection.php";

            $sql = "SELECT * FROM tbl_product";
            $stmt = $conn->prepare($sql);

            $stmt->execute();
            $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $conn = null; $stmt = null;

            return json_encode($returnValue);
        }
        
        function fetchActiveProduct(){
            include "connection.php";
        
            $sql = "SELECT * FROM tbl_product WHERE product_status != 0";
            $stmt = $conn->prepare($sql);
        
            $stmt->execute();
            $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $conn = null; $stmt = null;
        
            return json_encode($returnValue);
        }

        function countProduct(){
            include "connection.php";
        
            $sql = "SELECT COUNT(product_id) as productNum FROM tbl_product";
            $stmt = $conn->prepare($sql);
        
            $stmt->execute();
            $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $conn = null; $stmt = null;
        
            return json_encode($returnValue);
        }

        function countActiveProduct(){
            include "connection.php";
        
            $sql = "SELECT COUNT(product_id) as productNum FROM tbl_product WHERE product_status = 1";
            $stmt = $conn->prepare($sql);
        
            $stmt->execute();
            $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $conn = null; $stmt = null;
        
            return json_encode($returnValue);
        }
        
        function countArchivedProduct(){
            include "connection.php";
        
            $sql = "SELECT COUNT(product_id) as productNum FROM tbl_product WHERE product_status = 0";
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

    $product = new Product();
    switch ($operation){
        case "addProduct":
            echo $product->addProduct($json);
            break;
        case "updateProduct":
            echo $product->updateProduct($json);
            break;
        case "archiveAndRestoreProduct":
            echo $product->archiveAndRestoreProduct($json);
            break;
        case "getProduct":
            echo $product->getProduct();
            break;
        case "fetchActiveProduct":
            echo $product->fetchActiveProduct();
            break;
        case "countProduct":
            echo $product->countProduct();
            break;
        case "countActiveProduct":
            echo $product->countActiveProduct();
            break;
        case "countArchivedProduct":
            echo $product->countArchivedProduct();
            break;
    }

?>