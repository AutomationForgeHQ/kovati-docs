<#
.SYNOPSIS
  Save the image currently on the Windows clipboard to a PNG.

.DESCRIPTION
  A screenshot taken with Win+Shift+S lands on the clipboard and nowhere else.
  Pasting it into a chat shows it to the agent as a rendering, not as bytes —
  so the agent cannot write it back out. This reads the clipboard itself and
  writes the real file.

  Only the most recent clipboard item exists, so this captures one image per
  copy. Take a shot, run this, take the next.

.PARAMETER Out
  Destination PNG path. Parent directories are created.

.EXAMPLE
  .\save-clipboard-image.ps1 -Out public\shots\meshforge\stages.png
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string] $Out
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Clipboard access needs a single-threaded apartment. PowerShell 7 runs MTA by
# default, so do the read on an STA thread rather than asking the caller to
# launch a different shell.
# The apartment state has to be set before the runspace is opened, so build
# the runspace first rather than taking the one PowerShell::Create() makes.
$rs = [runspacefactory]::CreateRunspace()
$rs.ApartmentState = 'STA'
$rs.ThreadOptions = 'ReuseThread'
$rs.Open()

$job = [PowerShell]::Create()
$job.Runspace = $rs
[void]$job.AddScript({
    Add-Type -AssemblyName System.Windows.Forms
    if (-not [System.Windows.Forms.Clipboard]::ContainsImage()) { return $null }
    return [System.Windows.Forms.Clipboard]::GetImage()
  })
$img = $job.Invoke() | Select-Object -First 1
$job.Dispose()
$rs.Close()

if (-not $img) {
  throw "The clipboard holds no image. Take a screenshot (Win+Shift+S) and run this again."
}

$dir = Split-Path -Parent $Out
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

$img.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$w = $img.Width; $h = $img.Height
$img.Dispose()

[pscustomobject]@{
  Path   = (Resolve-Path $Out).Path
  Width  = $w
  Height = $h
}
