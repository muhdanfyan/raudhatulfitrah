<?php
$file = '/var/www/api-dev.pondokinformatika.id/config/cors.php';
$content = file_get_contents($file);
$domain = "    'https://dev.pondokinformatika.id',";
if (strpos($content, $domain) === false) {
    echo "Adding domain...";
    $newContent = str_replace("'allowed_origins' => [", "'allowed_origins' => [\n    'https://dev.pondokinformatika.id',\n    'http://dev.pondokinformatika.id',", $content);
    file_put_contents($file, $newContent);
    echo "Done.";
} else {
    echo "Domain already exists.";
}
