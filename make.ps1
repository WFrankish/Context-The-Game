Remove-Item "./site" -recurse
robocopy "./src" "./site" /S /XF *.ts