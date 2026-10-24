param([Parameter(Mandatory = $true)][string]$SourceDirectory)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
$siteDirectory = Split-Path -Parent $PSScriptRoot
$archiveDirectory = Join-Path $siteDirectory 'public/models/qr-grid-patch'
$sourceRoot = (Resolve-Path -LiteralPath $SourceDirectory).Path
$paper = Get-Content -LiteralPath (Join-Path $siteDirectory 'src/data/qr-grid-patch.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$variants = @(
    @{ id = 'hfss'; label = 'HFSS / FEM'; revision = 'v1'; software = 'HFSS / AEDT 2026 R1'; folder = 'HFSS_FEM'; names = @('QR_Patch_FEM_ModalRegion_20260728_v1.aedt') },
    @{ id = 'cst'; label = 'CST / FIT'; revision = 'v1'; software = 'CST 2026.1'; folder = ('CST_FDTD' + [char]0x7c7b + [char]0x65f6 + [char]0x57df); names = @('QR_Patch_CST_TD_WaveguidePort_20260728_v1.cst') },
    @{ id = 'feko'; label = 'FEKO / MoM'; revision = 'v3'; software = 'FEKO 2026.0'; folder = 'FEKO_MoM'; names = @('QR_Patch_MoM_EdgePort_20260728_v3.cfx', 'QR_Patch_MoM_EdgePort_20260728_v3.fek') }
)
# Only these four explicitly named native files are read. No solver is launched;
# no report, results cache, log or source-folder scripts are copied or executed.
$packages = @()
foreach ($variant in $variants) {
    $nativeFiles = @()
    foreach ($name in $variant.names) {
        $nativePath = Join-Path (Join-Path $sourceRoot $variant.folder) $name
        $native = Get-Item -LiteralPath $nativePath
        $nativeFiles += [ordered]@{ name = $name; bytes = $native.Length; sha256 = (Get-FileHash -LiteralPath $nativePath -Algorithm SHA256).Hash.ToLowerInvariant() }
    }
    $archiveName = "qr-grid-patch-$($variant.id)-$($variant.revision).zip"
    New-Item -ItemType Directory -Path $archiveDirectory -Force | Out-Null
    $archivePath = Join-Path $archiveDirectory $archiveName
    $stream = [System.IO.File]::Open($archivePath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
    $archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
    try {
        foreach ($file in $nativeFiles) {
            $nativePath = Join-Path (Join-Path $sourceRoot $variant.folder) $file.name
            $entry = $archive.CreateEntry($file.name, [System.IO.Compression.CompressionLevel]::Optimal)
            $entry.LastWriteTime = [DateTimeOffset]::new(2026, 8, 4, 0, 0, 0, [TimeSpan]::Zero)
            $entryStream = $entry.Open()
            $inputStream = [System.IO.File]::OpenRead($nativePath)
            try { $inputStream.CopyTo($entryStream) } finally { $inputStream.Dispose(); $entryStream.Dispose() }
            if ((Get-FileHash -LiteralPath $nativePath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $file.sha256) { throw "Source changed while packaging: $($file.name)" }
        }
        $readme = @"
QR-grid patch antenna / $($variant.label) / $($variant.revision)
Software used for the archived project: $($variant.software)
Engineering archive: 2026-08-04

AI-assisted reproduction: Lavax / RF Agent Lab.
Original antenna design and topology-optimization method: $($paper.source.authors)
$($paper.source.title)
$($paper.source.journal), $($paper.source.year), $($paper.source.volume)($($paper.source.issue)): $($paper.source.pages).
DOI: https://doi.org/$($paper.source.doi)

This package contains the unchanged core native files listed below, not the full
result-preserving archive. External result/cache folders are NOT included.
Opening, recalculating and inspecting saved results require the corresponding
licensed engineering software. Compatibility with older releases is not verified.
This website update did not reopen or solve the model. The paper and course report
are not distributed. The reproduction uses the final geometry, not a rerun of
the original topology optimization. No rights to the original publication are granted.

Files (SHA-256):
$(($nativeFiles | ForEach-Object { "$($_.name)  $($_.sha256)" }) -join "`n")
"@
        $readmeEntry = $archive.CreateEntry('README.txt')
        $readmeEntry.LastWriteTime = [DateTimeOffset]::new(2026, 8, 4, 0, 0, 0, [TimeSpan]::Zero)
        $writer = [System.IO.StreamWriter]::new($readmeEntry.Open(), [System.Text.UTF8Encoding]::new($false))
        try { $writer.Write($readme) } finally { $writer.Dispose() }
    } finally { $archive.Dispose(); $stream.Dispose() }
    $checkStream = [System.IO.File]::OpenRead($archivePath)
    $checkArchive = [System.IO.Compression.ZipArchive]::new($checkStream, [System.IO.Compression.ZipArchiveMode]::Read, $false)
    try {
        if ($checkArchive.Entries.Count -ne $nativeFiles.Count + 1) { throw 'Unexpected archive contents' }
        foreach ($file in $nativeFiles) {
            $entry = $checkArchive.GetEntry($file.name)
            if ($null -eq $entry -or $entry.Length -ne $file.bytes) { throw "Archive file mismatch: $($file.name)" }
            $entryStream = $entry.Open()
            $hashProvider = [System.Security.Cryptography.SHA256]::Create()
            try { $entryHash = [System.BitConverter]::ToString($hashProvider.ComputeHash($entryStream)).Replace('-', '').ToLowerInvariant() }
            finally { $hashProvider.Dispose(); $entryStream.Dispose() }
            $sourceHash = (Get-FileHash -LiteralPath (Join-Path (Join-Path $sourceRoot $variant.folder) $file.name) -Algorithm SHA256).Hash.ToLowerInvariant()
            if ($entryHash -ne $file.sha256 -or $sourceHash -ne $file.sha256) { throw "Native file hash mismatch: $($file.name)" }
        }
    } finally { $checkArchive.Dispose(); $checkStream.Dispose() }
    $packages += [ordered]@{
        id = $variant.id; label = $variant.label; revision = $variant.revision; software = $variant.software
        archiveDate = '2026-08-04'; filename = $archiveName; bytes = (Get-Item -LiteralPath $archivePath).Length
        sha256 = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant(); files = $nativeFiles
    }
}
$json = ConvertTo-Json -InputObject $packages -Depth 6
if ($json -match '[A-Za-z]:[\\/]') { throw 'Local path detected in public download metadata' }
[System.IO.File]::WriteAllText((Join-Path $siteDirectory 'src/data/qr-downloads.json'), "$json`n", [System.Text.UTF8Encoding]::new($false))
$packages | ForEach-Object { [PSCustomObject]$_ } | Select-Object label, revision, bytes, filename | Format-Table
