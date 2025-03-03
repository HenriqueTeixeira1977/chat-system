<?php
header('Content-Type: application/json');

$conn = new mysqli('localhost', 'root', 'sua_senha', 'chat_system');

if ($conn->connect_error) {
    die(json_encode(['error' => 'Database connection failed']));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'contacts') {
    $result = $conn->query('SELECT * FROM contacts');
    $contacts = [];
    while ($row = $result->fetch_assoc()) {
        $contacts[] = $row;
    }
    echo json_encode($contacts);
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $message = $data['message'];
    
    $stmt = $conn->prepare('INSERT INTO messages (content) VALUES (?)');
    $stmt->bind_param('s', $message);
    $stmt->execute();
    
    // Simulação de envio
    $result = $conn->query('SELECT * FROM contacts');
    $contacts = $result->fetch_all(MYSQLI_ASSOC);
    
    echo json_encode(['success' => true]);
}

$conn->close();
?>