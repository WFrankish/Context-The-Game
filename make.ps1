Remove-Item "./site" -recurse
robocopy "./src" "./site" /S /XF *.ts
robocopy "./assets" "./site/assets" /S /XF