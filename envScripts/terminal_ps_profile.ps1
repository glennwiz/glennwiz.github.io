oh-my-posh --init --shell pwsh --config ~/.mytheme.omp.json | Invoke-Expression
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

Write-Host "Running statup script! at $profile"
Write-Host "Alias: tig, less, mc, touch, grep, vim, rider, vs = visualStudio, csr = repel in console"
 
function ChangeTC{set-location c:}
function ChangeToDev {
    $currentPath = Get-Location
   
    if ($currentPath.Path -like "C:\dev*") {
         Write-Host "You are in a subdirectory of C:\dev"
    } else { 
        Set-Location "C:\dev"
    }
}
function Touch {New-Item -Name $args[0] -ItemType File}

function CountG {
    param(
        [switch]$lines
    )

    # Create an empty array to hold the output
    $outputArray = @()
    $outputArray += "``````";

    $folderPath = Get-Location

    $files = Get-ChildItem -Path $folderPath -Include *.cs, *.md, *.json -Recurse
    
    $totalLineCount = 0

    # Process each file
    foreach ($file in $files) {
        # Skip files in bin and obj folders
        if ($file.FullName -match "\\bin\\" -or $file.FullName -match "\\obj\\") {
            continue
        }

        # Read the file and filter out empty lines
        $content = Get-Content $file.FullName | Where-Object { $_.Trim() -ne "" }

        # Count the non-empty lines
        $lineCount = ($content | Measure-Object -Line).Lines

        # Add to the total line count
        $totalLineCount += $lineCount

        # Print out the file name and line count
        $fileInfo = "File: $($file.FullName) - Lines: $lineCount"
        Write-Host $fileInfo -ForegroundColor Cyan
        $outputArray +=  $fileInfo
        # If the lines flag is set, print the contents of each line
        if ($lines) {
            $fileInfo2 = "Contents of $($file.FullName):"
            $outputArray += $fileInfo2
            Write-Host $fileInfo2 -ForegroundColor Yellow
            $content | ForEach-Object { 
              Write-Host $_ 
              $outputArray += $_
              }
        } 
    }

    # Print out the total line count
    Write-Host "Total number of lines in all files: $totalLineCount"
    $outputArray += "Total number of lines in all files: $totalLineCount"
    $outputArray += "``````";

    # Output the array to the pipeline
    Write-Output $outputArray
}


set-alias cdc ChangeToC
set-alias cdd ChangeToDev
set-alias count CountG
set-alias rider 'C:\ProgramData\Microsoft\Windows\Start Menu\Programs\JetBrains\JetBrains Rider 2022.3.3.lnk'
set-alias vs 'C:\Program Files\Microsoft Visual Studio\2022\Professional\Common7\IDE\devenv.exe'
set-alias vim 'C:\Users\Glennwiz\scoop\shims\nvim.exe'
set-alias ll ls 
set-alias grep 'c:\Program files\git\usr\bin\grep.exe'
set-alias tig 'c:\Program files\git\usr\bin\tig.exe'
set-alias less 'c:\Program files\git\usr\bin\less.exe'
set-alias mc 'C:\Program Files (x86)\Midnight Commander\mc.exe'
set-alias touch 'New-Item'
set-alias csr 'csharprepl.exe'

# Import the Chocolatey Profile that contains the necessary code to enable
# tab-completions to function for `choco`.
# Be aware that if you are missing these lines from your profile, tab completion
# for `choco` will not function.
# See https://ch0.co/tab-completion for details.
$ChocolateyProfile = "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
if (Test-Path($ChocolateyProfile)) {
  Import-Module "$ChocolateyProfile"
}

# Move to dev folder
cdd