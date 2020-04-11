Remove-Item "./site" -recurse
robocopy "./src" "./site" /S /XF
robocopy "./assets" "./site/assets" /S /XF